import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && sessionData?.user) {
            const currentUser = sessionData.user;
            const currentEmail = currentUser.email;

            // Account linking logic: Check if user logged in via OAuth
            if (currentEmail && currentUser.app_metadata?.provider === 'google') {
                // Wait for the database trigger to create the profile
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if this is a newly created Google account (within last 30 seconds)
                const userCreatedAt = new Date(currentUser.created_at).getTime();
                const isNewGoogleUser = (Date.now() - userCreatedAt) < 30000;

                if (isNewGoogleUser && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    // Use admin client to check for existing email/password users with same email
                    const adminClient = createSupabaseAdmin(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY,
                        { auth: { autoRefreshToken: false, persistSession: false } }
                    );

                    const { data: { users: allUsers } } = await adminClient.auth.admin.listUsers({
                        page: 1,
                        perPage: 1000,
                    });

                    const existingEmailUser = allUsers?.find(u =>
                        u.email === currentEmail &&
                        u.id !== currentUser.id &&
                        u.identities?.some(i => i.provider === 'email')
                    );

                    if (existingEmailUser) {
                        // Found an existing email/password account with the same email.
                        // Store pending link info in a short-lived httpOnly cookie.
                        const pendingLink = {
                            googleUserId: currentUser.id,
                            emailUserId: existingEmailUser.id,
                            email: currentEmail,
                            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
                        };

                        cookieStore.set('pending_account_link', JSON.stringify(pendingLink), {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            maxAge: 600, // 10 minutes
                            path: '/',
                        });

                        // Determine locale from `next` param (e.g. /pt/comunidade → pt)
                        const localeMatch = next.match(/^\/(pt|en|ja)\//);
                        const locale = localeMatch?.[1] ?? 'pt';

                        const isLocal = origin.includes('localhost');
                        const forwardedHost = request.headers.get('x-forwarded-host');
                        const baseUrl = isLocal
                            ? origin
                            : forwardedHost
                                ? `https://${forwardedHost}`
                                : origin;

                        return NextResponse.redirect(`${baseUrl}/${locale}/link-account`);
                    }

                    // No email duplicate found – check existing admin/photographer linking (legacy)
                    const { data: currentProfile } = await supabase
                        .from('profiles')
                        .select('id, role, username, full_name, avatar_url, created_at')
                        .eq('id', currentUser.id)
                        .single();

                    if (currentProfile) {
                        const profileAge = Date.now() - new Date(currentProfile.created_at).getTime();
                        const isNewOAuthProfile = profileAge < 5000;

                        if (isNewOAuthProfile) {
                            const { data: existingAccounts } = await supabase
                                .from('profiles')
                                .select('id, role, username, full_name, avatar_url, created_at')
                                .neq('id', currentUser.id)
                                .in('role', ['admin', 'photographer'])
                                .order('created_at', { ascending: true })
                                .limit(20);

                            if (existingAccounts && existingAccounts.length > 0) {
                                let bestMatch: any = null;
                                let highestScore = 0;

                                for (const account of existingAccounts) {
                                    let score = 0;

                                    if (account.username && currentProfile.username) {
                                        const baseUsername = currentProfile.username.replace(/_oauth|_gmail/g, '');
                                        if (account.username === baseUsername) score += 10;
                                        if (account.username.includes(baseUsername) || baseUsername.includes(account.username)) score += 5;
                                    }

                                    if (account.full_name && currentProfile.full_name) {
                                        const name1 = account.full_name.toLowerCase().trim();
                                        const name2 = currentProfile.full_name.toLowerCase().trim();
                                        if (name1 === name2) score += 10;
                                        if (name1.includes(name2) || name2.includes(name1)) score += 5;
                                    }

                                    if (account.role === 'admin') score += 3;

                                    if (score > highestScore) {
                                        highestScore = score;
                                        bestMatch = account;
                                    }
                                }

                                if (bestMatch && highestScore >= 8) {
                                    const contentTables = ['posts', 'gallery_albums', 'businesses', 'calendar_events', 'jobs'];
                                    const communityTables = ['community_questions', 'community_answers', 'community_post_comments', 'community_posts', 'guides'];

                                    // Executar todas as atualizações em paralelo
                                    await Promise.all([
                                        supabase
                                            .from('profiles')
                                            .update({
                                                role: bestMatch.role,
                                                full_name: bestMatch.full_name,
                                                username: bestMatch.username + '_oauth',
                                                avatar_url: bestMatch.avatar_url || currentProfile.avatar_url,
                                            })
                                            .eq('id', currentUser.id),
                                        ...contentTables.map(table =>
                                            supabase.from(table).update({ created_by: currentUser.id }).eq('created_by', bestMatch.id)
                                        ),
                                        ...communityTables.map(table =>
                                            supabase.from(table).update({ author_id: currentUser.id }).eq('author_id', bestMatch.id)
                                        ),
                                    ]);
                                }
                            }
                        }
                    }
                }
            }

            const isLocalEnv = process.env.NODE_ENV === 'development';
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            }

            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocal = origin.includes('localhost');
            if (isLocal) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=AuthCodeError`);
}

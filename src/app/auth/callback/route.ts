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

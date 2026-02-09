import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

                // Check if this is a newly created OAuth profile
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('id, role, username, full_name, avatar_url, created_at')
                    .eq('id', currentUser.id)
                    .single();

                // If profile was just created (within last 5 seconds), it's a new OAuth login
                if (currentProfile) {
                    const profileAge = Date.now() - new Date(currentProfile.created_at).getTime();
                    const isNewOAuthProfile = profileAge < 5000; // Less than 5 seconds old

                    if (isNewOAuthProfile) {
                        // Look for an existing account that might be the same person
                        // Strategy: Find admin/photographer accounts with similar data
                        const { data: existingAccounts } = await supabase
                            .from('profiles')
                            .select('id, role, username, full_name, avatar_url, created_at')
                            .neq('id', currentUser.id)
                            .in('role', ['admin', 'photographer'])
                            .order('created_at', { ascending: true })
                            .limit(20);

                        if (existingAccounts && existingAccounts.length > 0) {
                            // Find the best match based on name similarity
                            let bestMatch: any = null;
                            let highestScore = 0;

                            for (const account of existingAccounts) {
                                let score = 0;

                                // Check username similarity
                                if (account.username && currentProfile.username) {
                                    const baseUsername = currentProfile.username.replace(/_oauth|_gmail/g, '');
                                    if (account.username === baseUsername) score += 10;
                                    if (account.username.includes(baseUsername) || baseUsername.includes(account.username)) score += 5;
                                }

                                // Check full name similarity
                                if (account.full_name && currentProfile.full_name) {
                                    const name1 = account.full_name.toLowerCase().trim();
                                    const name2 = currentProfile.full_name.toLowerCase().trim();
                                    if (name1 === name2) score += 10;
                                    if (name1.includes(name2) || name2.includes(name1)) score += 5;
                                }

                                // Prefer admin accounts
                                if (account.role === 'admin') score += 3;

                                if (score > highestScore) {
                                    highestScore = score;
                                    bestMatch = account;
                                }
                            }

                            // If we found a strong match (score >= 8), link the accounts
                            if (bestMatch && highestScore >= 8) {
                                console.log(`[Account Linking] Merging OAuth account ${currentUser.id} with existing account ${bestMatch.id}`);

                                // Update the new OAuth profile with data from the existing account
                                await supabase
                                    .from('profiles')
                                    .update({
                                        role: bestMatch.role,
                                        full_name: bestMatch.full_name,
                                        username: bestMatch.username + '_oauth',
                                        avatar_url: bestMatch.avatar_url || currentProfile.avatar_url,
                                    })
                                    .eq('id', currentUser.id);

                                // Transfer ownership of content from old account to new OAuth account
                                // This ensures all content is accessible via the OAuth login
                                const contentTables = [
                                    'posts',
                                    'gallery_albums',
                                    'businesses',
                                    'calendar_events',
                                    'jobs',
                                ];

                                for (const table of contentTables) {
                                    await supabase
                                        .from(table)
                                        .update({ created_by: currentUser.id })
                                        .eq('created_by', bestMatch.id);
                                }

                                const communityTables = [
                                    'community_questions',
                                    'community_answers',
                                    'community_post_comments',
                                    'community_posts',
                                    'guides',
                                ];

                                for (const table of communityTables) {
                                    await supabase
                                        .from(table)
                                        .update({ author_id: currentUser.id })
                                        .eq('author_id', bestMatch.id);
                                }

                                console.log(`[Account Linking] Successfully merged accounts`);
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

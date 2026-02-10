'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createAnonClient } from '@supabase/supabase-js';

interface PendingAccountLink {
    googleUserId: string;
    emailUserId: string;
    email: string;
    expiresAt: number;
}

async function readPendingLink(): Promise<PendingAccountLink | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get('pending_account_link')?.value;
    if (!raw) return null;
    try {
        const link = JSON.parse(raw) as PendingAccountLink;
        if (Date.now() > link.expiresAt) return null;
        return link;
    } catch {
        return null;
    }
}

/**
 * Merges the existing email/password account into the current Google account.
 * - Verifies the user knows the email account password.
 * - Transfers profile data and all content ownership to the Google account.
 * - Deletes the email/password account from auth.
 */
export async function mergeAccountsAction(password: string): Promise<{ success: boolean; error?: string }> {
    const pendingLink = await readPendingLink();
    if (!pendingLink) {
        return { success: false, error: 'session_expired' };
    }

    // Verify the currently logged-in user is the Google user in the cookie
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== pendingLink.googleUserId) {
        return { success: false, error: 'session_mismatch' };
    }

    // Verify password ownership: sign in with the email account using a stateless client
    // (persistSession: false ensures this doesn't interfere with the current Google session)
    const tempClient = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: emailAuth, error: passwordError } = await tempClient.auth.signInWithPassword({
        email: pendingLink.email,
        password,
    });

    if (passwordError || !emailAuth.user || emailAuth.user.id !== pendingLink.emailUserId) {
        return { success: false, error: 'wrong_password' };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { success: false, error: 'server_config' };
    }

    const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Copy profile fields from the email account to the Google account
    const { data: emailProfile } = await adminClient
        .from('profiles')
        .select('full_name, username, avatar_url, role, bio')
        .eq('id', pendingLink.emailUserId)
        .single();

    if (emailProfile) {
        const updatePayload: Record<string, unknown> = {
            full_name: emailProfile.full_name,
            username: emailProfile.username,
            role: emailProfile.role,
        };
        // Prefer the email account's avatar; fall back to Google's if not set
        if (emailProfile.avatar_url) {
            updatePayload.avatar_url = emailProfile.avatar_url;
        }
        if (emailProfile.bio) {
            updatePayload.bio = emailProfile.bio;
        }

        await adminClient
            .from('profiles')
            .update(updatePayload)
            .eq('id', pendingLink.googleUserId);
    }

    // Transfer content ownership – errors are non-fatal so we continue regardless
    const contentTables = ['posts', 'gallery_albums', 'businesses', 'calendar_events', 'jobs'];
    for (const table of contentTables) {
        await adminClient
            .from(table)
            .update({ created_by: pendingLink.googleUserId })
            .eq('created_by', pendingLink.emailUserId);
    }

    const communityTables = [
        'community_questions',
        'community_answers',
        'community_post_comments',
        'community_posts',
        'guides',
        'post_comments',
    ];
    for (const table of communityTables) {
        await adminClient
            .from(table)
            .update({ author_id: pendingLink.googleUserId })
            .eq('author_id', pendingLink.emailUserId);
    }

    // Delete the email/password account from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(pendingLink.emailUserId);
    if (deleteError) {
        console.error('[Account Linking] Failed to delete email user:', deleteError);
        // Non-fatal: the data is already transferred; we continue.
    }

    // Clear the pending link cookie
    const cookieStore = await cookies();
    cookieStore.delete('pending_account_link');

    return { success: true };
}

/**
 * Discards the pending account link and lets the user continue with their Google account only.
 */
export async function skipAccountLinkAction(): Promise<{ success: boolean }> {
    const cookieStore = await cookies();
    cookieStore.delete('pending_account_link');
    return { success: true };
}

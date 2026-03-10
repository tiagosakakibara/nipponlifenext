import { supabase } from './supabaseClient';
import { storageService } from './storageService';

// ===== TYPES =====
export interface ProfileUpdate {
    full_name?: string;
    username?: string;
    avatar_url?: string;
}

// ===== SERVICE =====

/**
 * Get the profile of the currently logged-in user
 */
export async function getMyProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    return { data, error };
}

/**
 * Update the profile of the currently logged-in user
 */
export async function updateMyProfile(userId: string, updates: ProfileUpdate) {
    // Fetch old avatar to potentially clean it up later
    let oldAvatarUrl: string | null = null;

    if (updates.avatar_url) {
        const { data: existing } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (existing?.avatar_url && existing.avatar_url !== updates.avatar_url) {
            oldAvatarUrl = existing.avatar_url;
        }
    }

    // Update the DB first
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    // If update successful and we have an old avatar to clean up, do it now
    if (!error && oldAvatarUrl) {
        await storageService.deleteFile(oldAvatarUrl).catch((err) => {
            console.error('Failed to cleanup old avatar after profile update', err);
        });
    }

    return { data, error };
}

/**
 * Admin: Get all profiles
 */
export const getAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            content_creation_access:content_creation_access!content_creation_access_user_id_fkey (
                access_type,
                status
            )
        `)
        .order('created_at', { ascending: false });

    return { data, error };
};

/**
 * Admin: Update user role
 */
export const updateUserRole = async (userId: string, role: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

/**
 * Admin: Update user status (ban/suspend)
 */
export const updateUserStatus = async (userId: string, status: string, reason?: string, until?: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            status,
            ban_reason: reason || null,
            ban_until: until || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

/**
 * Check if a username is available
 * Returns true if the username is available (not taken by another user)
 */
export async function checkUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
    const normalizedUsername = normalizeUsername(username);

    if (!validateUsername(normalizedUsername)) {
        return false;
    }

    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', normalizedUsername)
        .neq('id', currentUserId);

    if (error) {
        console.error('Error checking username:', error);
        return false;
    }

    return count === 0;
}

/**
 * Upload avatar image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadAvatar(_userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { url: null, error: 'Formato não suportado. Use PNG, JPG ou WebP.' };
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        return { url: null, error: 'Arquivo muito grande. Máximo 2MB.' };
    }

    // Upload using unified storage service
    try {
        const publicUrl = await storageService.uploadFile(file, 'profiles');
        return { url: publicUrl, error: null };
    } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        return { url: null, error: 'Erro ao fazer upload no servidor local.' };
    }
}

// ===== VALIDATION HELPERS =====

/**
 * Normalize username: lowercase, trimmed
 */
export function normalizeUsername(username: string): string {
    return username.toLowerCase().trim().replace(/^@/, '');
}

/**
 * Validate username format
 * Rules: 3-20 chars, only a-z, 0-9, _, .
 */
export function validateUsername(username: string): boolean {
    const regex = /^[a-z0-9._]{3,20}$/;
    return regex.test(username);
}

/**
 * Get validation error message for username
 */
export function getUsernameError(username: string): string | null {
    const normalized = normalizeUsername(username);

    if (!normalized) {
        return 'Username é obrigatório';
    }

    if (normalized.length < 3) {
        return 'Mínimo 3 caracteres';
    }

    if (normalized.length > 20) {
        return 'Máximo 20 caracteres';
    }

    if (!/^[a-z0-9._]+$/.test(normalized)) {
        return 'Use apenas letras, números, . e _';
    }

    return null;
}

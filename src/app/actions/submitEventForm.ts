'use server';

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function uploadEventFile(formData: FormData): Promise<{ url: string } | { error: string }> {
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'events';

    if (!file || file.size === 0) return { error: 'Arquivo inválido' };
    if (file.size > 10 * 1024 * 1024) return { error: 'Arquivo muito grande (máximo 10MB)' };

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) return { error: 'Tipo de arquivo não permitido' };

    try {
        const admin = getAdminClient();
        const ext = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await admin.storage
            .from('media')
            .upload(filePath, file, { contentType: file.type });

        if (uploadError) return { error: uploadError.message };

        const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(filePath);
        return { url: publicUrl };
    } catch {
        return { error: 'Erro ao fazer upload' };
    }
}

export async function submitEventForm(formData: FormData): Promise<{ success: true; id: string } | { error: string }> {
    try {
        const admin = getAdminClient();

        const title = formData.get('title') as string;
        const starts_at = formData.get('starts_at') as string;

        if (!title || !starts_at) {
            return { error: 'Preencha todos os campos obrigatórios.' };
        }

        // Slug único
        let slug = generateSlug(title);
        let uniqueSlug = slug;
        let counter = 1;
        while (true) {
            const { data: existing } = await admin.from('calendar_events').select('id').eq('slug', uniqueSlug).single();
            if (!existing) break;
            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        const ends_at_raw = formData.get('ends_at') as string;
        const cover_image_url = formData.get('cover_image_url') as string;
        const contact_url = formData.get('contact_url') as string;

        const record = {
            slug: uniqueSlug,
            status: 'draft' as const,

            title,
            starts_at: new Date(starts_at).toISOString(),
            ends_at: ends_at_raw ? new Date(ends_at_raw).toISOString() : null,

            location: (formData.get('location') as string) || null,
            google_maps_url: (formData.get('google_maps_url') as string) || null,
            description: (formData.get('description') as string) || null,
            cover_image_url: cover_image_url || null,
            contact_url: contact_url || null,
        };

        const { data, error } = await admin.from('calendar_events').insert([record]).select().single();
        if (error) return { error: error.message };

        return { success: true, id: data.id };
    } catch (e: any) {
        return { error: e?.message || 'Erro inesperado' };
    }
}

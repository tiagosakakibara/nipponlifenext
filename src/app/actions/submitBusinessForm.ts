'use server';

import { createClient } from '@supabase/supabase-js';

// Admin client com service role para inserir sem auth
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

function generateBaseSlug(name: string, city: string): string {
    const combined = `${name}-${city}`;
    return combined
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function uploadBusinessFile(formData: FormData): Promise<{ url: string } | { error: string }> {
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'businesses';

    if (!file || file.size === 0) return { error: 'Arquivo inválido' };

    // 10MB limit
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
    } catch (e) {
        return { error: 'Erro ao fazer upload' };
    }
}

export async function submitBusinessForm(formData: FormData): Promise<{ success: true; id: string } | { error: string }> {
    try {
        const admin = getAdminClient();

        // Campos obrigatórios
        const business_name = formData.get('business_name') as string;
        const category = formData.get('category') as string;
        const description_short = formData.get('description_short') as string;
        const address_line1 = formData.get('address_line1') as string;
        const city = formData.get('city') as string;
        const prefecture = formData.get('prefecture') as string;

        if (!business_name || !category || !description_short || !address_line1 || !city || !prefecture) {
            return { error: 'Preencha todos os campos obrigatórios.' };
        }

        // Gerar slug único
        let slug = generateBaseSlug(business_name, city);
        let uniqueSlug = slug;
        let counter = 1;

        while (true) {
            const { data: existing } = await admin
                .from('businesses')
                .select('id')
                .eq('slug', uniqueSlug)
                .single();
            if (!existing) break;
            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        // Montar opening_hours a partir dos campos nomeados
        const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo', 'feriados'];
        const opening_hours: Record<string, string> = {};
        for (const day of days) {
            const isOpen = formData.get(`hours_open_${day}`) === 'true';
            if (isOpen) {
                const open = formData.get(`hours_from_${day}`) as string;
                const close = formData.get(`hours_to_${day}`) as string;
                if (open && close) opening_hours[day] = `${open} - ${close}`;
            }
        }

        // languages_supported
        const langs = formData.getAll('languages_supported') as string[];

        // price_range
        const price_range = (formData.get('price_range') as string) || null;

        const record = {
            slug: uniqueSlug,
            status: 'draft' as const,  // entra como rascunho para você revisar
            featured: false,
            country: 'Japan',

            business_name,
            category,
            description_short,
            description_long: (formData.get('description_long') as string) || null,

            address_line1,
            address_line2: (formData.get('address_line2') as string) || null,
            neighborhood: (formData.get('neighborhood') as string) || null,
            city,
            prefecture,
            postal_code: (formData.get('postal_code') as string) || '',
            google_maps_url: (formData.get('google_maps_url') as string) || null,
            latitude: null,
            longitude: null,

            phone: (formData.get('phone') as string) || null,
            whatsapp: (formData.get('whatsapp') as string) || null,
            email: (formData.get('email') as string) || null,
            website_url: (formData.get('website_url') as string) || null,
            instagram_url: (formData.get('instagram_url') as string) || null,
            line_url: (formData.get('line_url') as string) || null,

            logo_url: (formData.get('logo_url') as string) || null,
            cover_image_url: (formData.get('cover_image_url') as string) || null,
            gallery_images: null,
            presentation_url: null,
            video_url: null,

            opening_hours: Object.keys(opening_hours).length > 0 ? opening_hours : null,
            price_range,
            languages_supported: langs.length > 0 ? langs : null,
            tags: null,
        };

        const { data, error } = await admin
            .from('businesses')
            .insert([record])
            .select()
            .single();

        if (error) return { error: error.message };

        return { success: true, id: data.id };
    } catch (e: any) {
        return { error: e?.message || 'Erro inesperado' };
    }
}

import { supabase } from './supabaseClient';

// Types
export interface Guide {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image_url: string | null;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at: string | null;
    scheduled_for: string | null;
    author_id: string | null;
    reading_time_minutes: number | null;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    // Translation fields
    title_ja?: string | null;
    excerpt_ja?: string | null;
    content_ja?: string | null;
    title_en?: string | null;
    excerpt_en?: string | null;
    content_en?: string | null;
    // Joined fields
    category_name?: string;
    author_name?: string;
    view_count?: number;
}

export interface GuideInput {
    category_id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    cover_image_url?: string | null;
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at?: string | null;
    scheduled_for?: string | null;
    author_id?: string | null;
    reading_time_minutes?: number | null;
    is_featured?: boolean;
    // Translation fields
    title_ja?: string | null;
    excerpt_ja?: string | null;
    content_ja?: string | null;
    title_en?: string | null;
    excerpt_en?: string | null;
    content_en?: string | null;
}

// Slugify helper
export function slugifyTitle(text: string): string {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Get unique slug
export async function getUniqueGuideSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
        let query = supabase
            .from('guides')
            .select('id')
            .eq('slug', finalSlug);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data } = await query.maybeSingle();
        if (!data) break;
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }

    return finalSlug;
}

// List guides with filters
export async function listGuides(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
    orderBy?: 'updated_at' | 'published_at' | 'created_at' | 'title';
}) {
    let query = supabase
        .from('guides')
        .select(`
            *,
            guides_categories (name)
        `);

    if (filters?.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
    }

    const orderBy = filters?.orderBy || 'updated_at';
    query = query.order(orderBy, { ascending: false });

    const { data, error } = await query.limit(100);

    if (data) {
        const mappedData = data.map((g: any) => ({
            ...g,
            category_name: g.guides_categories?.name || null,
        }));
        return { data: mappedData as Guide[], error };
    }

    return { data: null, error };
}

// Get guide by ID
export async function getGuideById(id: string) {
    const { data, error } = await supabase
        .from('guides')
        .select(`
            *,
            guides_categories (name)
        `)
        .eq('id', id)
        .single();

    if (data) {
        return {
            data: {
                ...data,
                category_name: (data as any).guides_categories?.name || null,
            } as Guide,
            error,
        };
    }

    return { data: null, error };
}

// Get guide by slug
export async function getGuideBySlug(slug: string) {
    const { data, error } = await supabase
        .from('guides')
        .select(`
            *,
            guides_categories (name)
        `)
        .eq('slug', slug)
        .maybeSingle();

    if (data) {
        return {
            data: {
                ...data,
                category_name: (data as any).guides_categories?.name || null,
            } as Guide,
            error,
        };
    }

    return { data: null, error };
}

// Create guide
export async function createGuide(input: GuideInput) {
    const uniqueSlug = await getUniqueGuideSlug(input.slug || slugifyTitle(input.title));

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('guides')
        .insert({
            category_id: input.category_id,
            title: input.title.trim(),
            slug: uniqueSlug,
            excerpt: input.excerpt?.trim() || null,
            content: input.content?.trim() || null,
            cover_image_url: input.cover_image_url || null,
            status: input.status || 'draft',
            published_at: input.published_at || null,
            scheduled_for: input.scheduled_for || null,
            author_id: input.author_id || userData?.user?.id || null,
            reading_time_minutes: input.reading_time_minutes || null,
            is_featured: input.is_featured ?? false,
            // Translations
            title_ja: input.title_ja || null,
            excerpt_ja: input.excerpt_ja || null,
            content_ja: input.content_ja || null,
            title_en: input.title_en || null,
            excerpt_en: input.excerpt_en || null,
            content_en: input.content_en || null,
        })
        .select()
        .single();

    return { data: data as Guide | null, error };
}

import { storageService } from './storageService';

// ... (types and other functions same)

// Update guide
export async function updateGuide(id: string, input: Partial<GuideInput>) {
    // Handle old cover image deletion if replaced
    if (input.cover_image_url !== undefined) {
        const { data: existing } = await supabase
            .from('guides')
            .select('cover_image_url')
            .eq('id', id)
            .single();

        if (existing?.cover_image_url && existing.cover_image_url !== input.cover_image_url) {
            await storageService.deleteFile(existing.cover_image_url);
        }
    }

    const updates: any = { updated_at: new Date().toISOString() };

    if (input.category_id !== undefined) updates.category_id = input.category_id;
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.slug !== undefined) {
        updates.slug = await getUniqueGuideSlug(input.slug, id);
    }
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt?.trim() || null;
    if (input.content !== undefined) updates.content = input.content?.trim() || null;
    if (input.cover_image_url !== undefined) updates.cover_image_url = input.cover_image_url;
    if (input.status !== undefined) updates.status = input.status;
    if (input.published_at !== undefined) updates.published_at = input.published_at;
    if (input.scheduled_for !== undefined) updates.scheduled_for = input.scheduled_for;
    if (input.reading_time_minutes !== undefined) updates.reading_time_minutes = input.reading_time_minutes;
    if (input.is_featured !== undefined) updates.is_featured = input.is_featured;

    // Translation fields
    if (input.title_ja !== undefined) updates.title_ja = input.title_ja;
    if (input.excerpt_ja !== undefined) updates.excerpt_ja = input.excerpt_ja;
    if (input.content_ja !== undefined) updates.content_ja = input.content_ja;
    if (input.title_en !== undefined) updates.title_en = input.title_en;
    if (input.excerpt_en !== undefined) updates.excerpt_en = input.excerpt_en;
    if (input.content_en !== undefined) updates.content_en = input.content_en;

    const { data, error } = await supabase
        .from('guides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data: data as Guide | null, error };
}

// Delete guide
export async function deleteGuide(id: string) {
    // 1. Get guide data to find cover image URL
    const { data: guide } = await supabase
        .from('guides')
        .select('cover_image_url')
        .eq('id', id)
        .single();

    if (guide?.cover_image_url) {
        await storageService.deleteFile(guide.cover_image_url);
    }

    // 2. Delete record
    const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id);

    return { error };
}

export const guidesService = {
    listGuides,
    getGuideById,
    getGuideBySlug,
    createGuide,
    updateGuide,
    deleteGuide,
    slugifyTitle,
    getUniqueGuideSlug,
};

import { supabase } from './supabaseClient';

// Types
export interface GuideCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    // Translations
    name_ja?: string | null;
    name_en?: string | null;
    description_ja?: string | null;
    description_en?: string | null;
}

export interface GuideCategoryInput {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    sort_order?: number;
    is_active?: boolean;
    // Translations
    name_ja?: string | null;
    name_en?: string | null;
    description_ja?: string | null;
    description_en?: string | null;
}

// Slugify helper
export function slugifyName(text: string): string {
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

// List categories with filters
export async function listCategories(filters?: {
    search?: string;
    activeOnly?: boolean;
    orderBy?: 'sort_order' | 'created_at' | 'name';
}) {
    let query = supabase
        .from('guides_categories')
        .select('*');

    if (filters?.activeOnly) {
        query = query.eq('is_active', true);
    }

    if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    const orderBy = filters?.orderBy || 'sort_order';
    if (orderBy === 'sort_order') {
        query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    } else if (orderBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
    } else {
        query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;
    return { data: data as GuideCategory[] | null, error };
}

// Get category by ID
export async function getCategoryById(id: string) {
    const { data, error } = await supabase
        .from('guides_categories')
        .select('*')
        .eq('id', id)
        .single();
    return { data: data as GuideCategory | null, error };
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
        .from('guides_categories')
        .select('*')
        .eq('slug', slug)
        .single();
    return { data: data as GuideCategory | null, error };
}

// Get unique slug
export async function getUniqueCategorySlug(baseSlug: string, excludeId?: string): Promise<string> {
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
        let query = supabase
            .from('guides_categories')
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

// Create category
export async function createCategory(input: GuideCategoryInput) {
    const uniqueSlug = await getUniqueCategorySlug(input.slug || slugifyName(input.name));

    const { data, error } = await supabase
        .from('guides_categories')
        .insert({
            name: input.name.trim(),
            slug: uniqueSlug,
            description: input.description?.trim() || null,
            icon: input.icon?.trim() || null,
            sort_order: input.sort_order ?? 0,
            is_active: input.is_active ?? true,
            name_ja: input.name_ja?.trim() || null,
            name_en: input.name_en?.trim() || null,
            description_ja: input.description_ja?.trim() || null,
            description_en: input.description_en?.trim() || null,
        })
        .select()
        .single();

    return { data: data as GuideCategory | null, error };
}

// Update category
export async function updateCategory(id: string, input: Partial<GuideCategoryInput>) {
    const updates: any = {};

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.slug !== undefined) {
        updates.slug = await getUniqueCategorySlug(input.slug, id);
    }
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    if (input.icon !== undefined) updates.icon = input.icon?.trim() || null;
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order;
    if (input.is_active !== undefined) updates.is_active = input.is_active;
    if (input.name_ja !== undefined) updates.name_ja = input.name_ja?.trim() || null;
    if (input.name_en !== undefined) updates.name_en = input.name_en?.trim() || null;
    if (input.description_ja !== undefined) updates.description_ja = input.description_ja?.trim() || null;
    if (input.description_en !== undefined) updates.description_en = input.description_en?.trim() || null;

    const { data, error } = await supabase
        .from('guides_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data: data as GuideCategory | null, error };
}

// Delete category
export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('guides_categories')
        .delete()
        .eq('id', id);

    return { error };
}

export const guidesCategoriesService = {
    listCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    slugifyName,
    getUniqueCategorySlug,
    getCategoryBySlug,
};

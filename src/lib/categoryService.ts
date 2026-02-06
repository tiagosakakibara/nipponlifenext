import { supabase } from './supabaseClient';

const DB_TABLE = 'categories';

export interface Category {
    id: string;
    slug: string;
    name: string;
    sort_order?: number;
    is_active?: boolean;
}

export const categoryService = {
    async getCategories() {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return (data || []).map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            sort_order: c.sort_order || 0,
            is_active: c.is_active !== false
        }));
    },

    async createCategory(data: { slug: string; name: string }) {
        const { data: newCat, error } = await supabase
            .from(DB_TABLE)
            .insert([{
                slug: data.slug,
                name: data.name,
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;
        return newCat;
    },

    async updateCategory(slug: string, data: { name: string }) {
        const { data: updated, error } = await supabase
            .from(DB_TABLE)
            .update({ name: data.name })
            .eq('slug', slug)
            .select()
            .single();

        if (error) throw error;
        return updated;
    },

    async deleteCategory(slug: string) {
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('slug', slug);

        if (error) throw error;
    }
};

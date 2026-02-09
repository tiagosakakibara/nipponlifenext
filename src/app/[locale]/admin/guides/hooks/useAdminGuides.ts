"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

export interface AdminGuide {
    id: string;
    title: string;
    slug: string;
    categoryKey: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    status: 'published' | 'draft' | 'archived';
    readingTimeMinutes: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;

    // Translations
    title_ja?: string;
    title_en?: string;
    excerpt_ja?: string;
    excerpt_en?: string;
    content_ja?: string;
    content_en?: string;
}

export interface AdminGuideCategory {
    id: string;
    key: string; // slug
    label: string;
    is_active: boolean;
}

export function useAdminGuides() {
    const [guides, setGuides] = useState<AdminGuide[]>([]);
    const [categories, setCategories] = useState<AdminGuideCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('guides_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        const mapped: AdminGuideCategory[] = data.map((c: any) => ({
            id: c.id,
            key: c.slug,
            label: c.name,
            is_active: c.is_active !== false
        }));
        setCategories(mapped);
        return mapped;
    }, [supabase]);

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchCategories();

            const { data, error } = await supabase
                .from('guides')
                .select(`
                    *,
                    guides_categories (slug, name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setGuides(data.map((g: any) => ({
                    id: g.id,
                    title: g.title,
                    slug: g.slug,
                    categoryKey: g.guides_categories?.slug || 'uncategorized',
                    excerpt: g.excerpt || '',
                    content: g.content || '',
                    coverImageUrl: g.cover_image_url || '',
                    status: g.status,
                    readingTimeMinutes: g.reading_time_minutes || 0,
                    viewCount: g.view_count || 0,
                    createdAt: g.created_at,
                    updatedAt: g.updated_at,
                    title_ja: g.title_ja,
                    title_en: g.title_en,
                    excerpt_ja: g.excerpt_ja,
                    excerpt_en: g.excerpt_en,
                    content_ja: g.content_ja,
                    content_en: g.content_en,
                })));
            }
        } catch (err: any) {
            console.error('Error fetching guides:', err);
            setError(err.message);
            toast.error('Erro ao carregar guias');
        } finally {
            setLoading(false);
        }
    }, [supabase, fetchCategories]);

    const addGuide = async (guide: Partial<AdminGuide>): Promise<boolean> => {
        try {
            // Find category id by slug
            const { data: catData } = await supabase
                .from('guides_categories')
                .select('id')
                .eq('slug', guide.categoryKey)
                .single();

            if (!catData) {
                toast.error('Categoria inválida');
                return false;
            }

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('guides')
                .insert([{
                    title: guide.title,
                    slug: guide.slug,
                    category_id: catData.id,
                    excerpt: guide.excerpt,
                    content: guide.content,
                    cover_image_url: guide.coverImageUrl,
                    status: guide.status,
                    reading_time_minutes: guide.readingTimeMinutes,
                    // created_by: user?.id, // Assuming guides table has created_by
                    title_ja: guide.title_ja,
                    title_en: guide.title_en,
                    excerpt_ja: guide.excerpt_ja,
                    excerpt_en: guide.excerpt_en,
                    content_ja: guide.content_ja,
                    content_en: guide.content_en,
                }]);

            if (error) throw error;

            await fetchGuides();
            return true;
        } catch (error: any) {
            console.error('Error adding guide:', error);
            toast.error('Erro ao criar guia: ' + error.message);
            return false;
        }
    };

    const updateGuide = async (id: string, updated: Partial<AdminGuide>): Promise<boolean> => {
        try {
            const { data: catData } = await supabase
                .from('guides_categories')
                .select('id')
                .eq('slug', updated.categoryKey)
                .single();

            if (!catData) {
                toast.error('Categoria inválida');
                return false;
            }

            const updates: any = {
                title: updated.title,
                slug: updated.slug,
                category_id: catData.id,
                excerpt: updated.excerpt,
                content: updated.content,
                cover_image_url: updated.coverImageUrl,
                status: updated.status,
                reading_time_minutes: updated.readingTimeMinutes,
                updated_at: new Date().toISOString(),
                title_ja: updated.title_ja,
                title_en: updated.title_en,
                excerpt_ja: updated.excerpt_ja,
                excerpt_en: updated.excerpt_en,
                content_ja: updated.content_ja,
                content_en: updated.content_en,
            };

            const { error } = await supabase
                .from('guides')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            await fetchGuides();
            return true;
        } catch (error: any) {
            console.error('Error updating guide:', error);
            toast.error('Erro ao atualizar guia');
            return false;
        }
    };

    const deleteGuide = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este guia?')) return;

        try {
            const { error } = await supabase
                .from('guides')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Guia excluído com sucesso');
            await fetchGuides();
        } catch (error: any) {
            console.error('Error deleting guide:', error);
            toast.error('Erro ao excluir guia');
        }
    };

    // Fetch Single Guide
    const getGuide = async (id: string): Promise<AdminGuide | null> => {
        try {
            const { data, error } = await supabase
                .from('guides')
                .select(`
                    *,
                    guides_categories (slug, name)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                title: data.title,
                slug: data.slug,
                categoryKey: data.guides_categories?.slug || 'uncategorized',
                excerpt: data.excerpt || '',
                content: data.content || '',
                coverImageUrl: data.cover_image_url || '',
                status: data.status,
                readingTimeMinutes: data.reading_time_minutes || 0,
                viewCount: data.view_count || 0,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                title_ja: data.title_ja,
                title_en: data.title_en,
                excerpt_ja: data.excerpt_ja,
                excerpt_en: data.excerpt_en,
                content_ja: data.content_ja,
                content_en: data.content_en,
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    return {
        guides,
        categories,
        loading,
        error,
        fetchGuides,
        addGuide,
        updateGuide,
        deleteGuide,
        getGuide
    };
}

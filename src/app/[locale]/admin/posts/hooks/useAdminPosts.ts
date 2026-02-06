"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

export interface AdminPost {
    id: string;
    title: string;
    slug: string;
    categoryKey: string;
    excerpt: string;
    content: string;
    coverImageUrl: string; // CamelCase for internal use, though DB is snake_case
    status: 'published' | 'draft' | 'scheduled';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    // Markdown
    content_md?: string;
    content_ja_md?: string;
    content_en_md?: string;
    // Tranlations
    title_ja?: string;
    title_en?: string;
    excerpt_ja?: string;
    excerpt_en?: string;
    content_ja?: string;
    content_en?: string;
    allowComments: boolean;
    pinned: boolean;
}

export interface AdminCategory {
    id: string;
    key: string; // slug
    label: string;
    is_active: boolean;
}

export function useAdminPosts() {
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        const mapped: AdminCategory[] = data.map((c: any) => ({
            id: c.id,
            key: c.slug,
            label: c.name,
            is_active: c.is_active !== false
        }));
        setCategories(mapped);
        return mapped;
    }, [supabase]);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchCategories();

            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    categories (slug)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setPosts(data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    categoryKey: p.categories?.slug || 'uncategorized',
                    excerpt: p.excerpt,
                    content: p.content,
                    coverImageUrl: p.cover_image_url,
                    status: p.status,
                    publishedAt: p.published_at,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                    tags: p.tags || [],
                    content_md: p.content_md,
                    content_ja_md: p.content_ja_md,
                    content_en_md: p.content_en_md,
                    title_ja: p.title_ja,
                    title_en: p.title_en,
                    excerpt_ja: p.excerpt_ja,
                    excerpt_en: p.excerpt_en,
                    content_ja: p.content_ja,
                    content_en: p.content_en,
                    allowComments: p.allow_comments !== false,
                    pinned: p.pinned || false
                })));
            }
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError(err.message);
            toast.error('Erro ao carregar posts');
        } finally {
            setLoading(false);
        }
    }, [supabase, fetchCategories]);

    const addPost = async (post: Partial<AdminPost>): Promise<boolean> => {
        try {
            // Find category id by slut
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', post.categoryKey)
                .single();

            if (!catData) {
                toast.error('Categoria inválida');
                return false;
            }

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('posts')
                .insert([{
                    title: post.title,
                    slug: post.slug,
                    category_id: catData.id,
                    excerpt: post.excerpt,
                    content: post.content,
                    cover_image_url: post.coverImageUrl,
                    status: post.status,
                    published_at: post.publishedAt,
                    created_by: user?.id,
                    tags: post.tags || [],
                    content_md: post.content_md,
                    content_ja_md: post.content_ja_md,
                    content_en_md: post.content_en_md,
                    title_ja: post.title_ja,
                    title_en: post.title_en,
                    excerpt_ja: post.excerpt_ja,
                    excerpt_en: post.excerpt_en,
                    content_ja: post.content_ja,
                    content_en: post.content_en,
                    allow_comments: post.allowComments !== false,
                    pinned: post.pinned
                }]);

            if (error) throw error;

            await fetchPosts();
            return true;
        } catch (error: any) {
            console.error('Error adding post:', error);
            toast.error('Erro ao criar post: ' + error.message);
            return false;
        }
    };

    const updatePost = async (id: string, updated: Partial<AdminPost>): Promise<boolean> => {
        try {
            const { data: catData } = await supabase
                .from('categories')
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
                published_at: updated.publishedAt,
                tags: updated.tags || [],
                updated_at: new Date().toISOString(),
                content_md: updated.content_md,
                content_ja_md: updated.content_ja_md,
                content_en_md: updated.content_en_md,
                title_ja: updated.title_ja,
                title_en: updated.title_en,
                excerpt_ja: updated.excerpt_ja,
                excerpt_en: updated.excerpt_en,
                content_ja: updated.content_ja,
                content_en: updated.content_en,
                allow_comments: updated.allowComments !== false,
                pinned: updated.pinned
            };

            const { error } = await supabase
                .from('posts')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            await fetchPosts();
            return true;
        } catch (error: any) {
            console.error('Error updating post:', error);
            toast.error('Erro ao atualizar post');
            return false;
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Post excluído com sucesso');
            await fetchPosts();
        } catch (error: any) {
            console.error('Error deleting post:', error);
            toast.error('Erro ao excluir post');
        }
    };

    // Fetch Single Post
    const getPost = async (id: string): Promise<AdminPost | null> => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    categories (slug)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                title: data.title,
                slug: data.slug,
                categoryKey: data.categories?.slug || 'uncategorized',
                excerpt: data.excerpt,
                content: data.content,
                coverImageUrl: data.cover_image_url,
                status: data.status,
                publishedAt: data.published_at,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                tags: data.tags || [],
                content_md: data.content_md,
                content_ja_md: data.content_ja_md,
                content_en_md: data.content_en_md,
                title_ja: data.title_ja,
                title_en: data.title_en,
                excerpt_ja: data.excerpt_ja,
                excerpt_en: data.excerpt_en,
                content_ja: data.content_ja,
                content_en: data.content_en,
                allowComments: data.allow_comments !== false,
                pinned: data.pinned || false
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    return {
        posts,
        categories,
        loading,
        error,
        fetchPosts,
        addPost,
        updatePost,
        deletePost,
        getPost
    };
}

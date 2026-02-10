import { supabase } from './supabaseClient';

const DB_TABLE = 'community_posts';

export interface CommunityPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image_url: string | null;
    category_id: string | null;
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at: string | null;
    scheduled_for: string | null;
    like_count: number;
    comment_count: number;
    view_count: number;
    created_at: string;
    updated_at: string;
    // Multilingual fields
    title_ja?: string | null;
    title_en?: string | null;
    excerpt_ja?: string | null;
    excerpt_en?: string | null;
    content_ja?: string | null;
    content_en?: string | null;
}

export const communityService = {
    async getAdminPosts() {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select(`
                *,
                community_categories (id, name, slug)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map((p: any) => ({
            ...p,
            category_name: p.community_categories?.name || null
        }));
    },

    async getPostById(id: string) {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*, community_post_tags(tag)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPost(post: Partial<CommunityPost>, tags: string[] = []) {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .insert([post])
            .select()
            .single();

        if (error) throw error;

        if (tags.length > 0) {
            const tagInserts = tags.map(tag => ({
                post_id: data.id,
                tag: tag.trim()
            }));
            await supabase.from('community_post_tags').insert(tagInserts);
        }

        return data;
    },

    async updatePost(id: string, post: Partial<CommunityPost>, tags: string[] = []) {
        // 1. Get old post data to compare images
        const { data: oldPost } = await supabase
            .from(DB_TABLE)
            .select('cover_image_url, content, content_ja, content_en')
            .eq('id', id)
            .single();

        // 2. Update the post
        const { data, error } = await supabase
            .from(DB_TABLE)
            .update({ ...post, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update tags
        await supabase.from('community_post_tags').delete().eq('post_id', id);
        if (tags.length > 0) {
            const tagInserts = tags.map(tag => ({
                post_id: id,
                tag: tag.trim()
            }));
            await supabase.from('community_post_tags').insert(tagInserts);
        }

        // 3. Clean up removed images (async, don't wait)
        if (oldPost) {
            const newPost = {
                cover_image_url: post.cover_image_url,
                content: post.content,
                content_ja: post.content_ja,
                content_en: post.content_en
            };

            const { mediaCleanupService } = await import('./mediaCleanupService');
            mediaCleanupService.cleanupRemovedImages(oldPost, newPost).catch(err =>
                console.error('Error cleaning up removed images:', err)
            );
        }

        return data;
    },

    async deletePost(id: string) {
        // 1. Get post data to extract images
        const { data: post } = await supabase
            .from(DB_TABLE)
            .select('cover_image_url, content, content_ja, content_en')
            .eq('id', id)
            .single();

        // 2. Delete the post from database
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;

        // 3. Clean up associated images (async, don't wait)
        if (post) {
            const { mediaCleanupService } = await import('./mediaCleanupService');
            mediaCleanupService.cleanupPostImages(post).catch(err =>
                console.error('Error cleaning up community post images:', err)
            );
        }
    },

    async getCategories() {
        const { data, error } = await supabase
            .from('community_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }
};

import { storageService } from './storageService';
import { supabase } from './supabaseClient';

/**
 * Utility service for cleaning up orphaned media files
 * Automatically deletes images from storage and media repository when posts are deleted
 */
export const mediaCleanupService = {
    /**
     * Extract all image URLs from HTML content
     */
    extractImageUrls(content: string | null | undefined): string[] {
        if (!content) return [];

        const urls: string[] = [];

        // Match img tags: <img src="..." />
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // Match markdown images: ![alt](url)
        const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        while ((match = mdRegex.exec(content)) !== null) {
            urls.push(match[2]);
        }

        // Match background-image in style attributes
        const bgRegex = /background-image:\s*url\(['"]?([^'"()]+)['"]?\)/gi;
        while ((match = bgRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // Filter to only include Supabase storage URLs
        return urls.filter(url =>
            url.includes('supabase.co/storage') ||
            url.includes('/storage/v1/object/public/')
        );
    },

    /**
     * Delete a single image from both storage and media table
     */
    async deleteImage(imageUrl: string): Promise<boolean> {
        try {
            // 1. Delete from Supabase Storage
            await storageService.deleteFile(imageUrl);

            // 2. Delete from media table (if exists)
            const { error } = await supabase
                .from('media')
                .delete()
                .eq('public_url', imageUrl);

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (OK)
                console.error('Error deleting from media table:', error);
            }

            return true;
        } catch (error) {
            console.error('Error deleting image:', imageUrl, error);
            return false;
        }
    },

    /**
     * Delete multiple images in parallel
     */
    async deleteImages(imageUrls: string[]): Promise<void> {
        if (imageUrls.length === 0) return;

        console.log(`🗑️ Cleaning up ${imageUrls.length} images...`);

        await Promise.allSettled(
            imageUrls.map(url => this.deleteImage(url))
        );

        console.log(`✅ Cleanup complete`);
    },

    /**
     * Clean up images from a post
     * Extracts all images from content and deletes them
     */
    async cleanupPostImages(post: {
        cover_image_url?: string | null;
        content?: string | null;
        content_ja?: string | null;
        content_en?: string | null;
        content_md?: string | null;
        content_ja_md?: string | null;
        content_en_md?: string | null;
    }): Promise<void> {
        const imagesToDelete: string[] = [];

        // Add cover image
        if (post.cover_image_url) {
            imagesToDelete.push(post.cover_image_url);
        }

        // Extract from all content fields
        const contentFields = [
            post.content,
            post.content_ja,
            post.content_en,
            post.content_md,
            post.content_ja_md,
            post.content_en_md
        ];

        for (const content of contentFields) {
            const urls = this.extractImageUrls(content);
            imagesToDelete.push(...urls);
        }

        // Remove duplicates
        const uniqueUrls = [...new Set(imagesToDelete)];

        // Delete all images
        await this.deleteImages(uniqueUrls);
    },

    /**
     * Clean up images when updating a post
     * Compares old and new content to delete only removed images
     */
    async cleanupRemovedImages(
        oldPost: {
            cover_image_url?: string | null;
            content?: string | null;
            content_ja?: string | null;
            content_en?: string | null;
            content_md?: string | null;
            content_ja_md?: string | null;
            content_en_md?: string | null;
        },
        newPost: {
            cover_image_url?: string | null;
            content?: string | null;
            content_ja?: string | null;
            content_en?: string | null;
            content_md?: string | null;
            content_ja_md?: string | null;
            content_en_md?: string | null;
        }
    ): Promise<void> {
        // Get all images from old post
        const oldImages = new Set<string>();

        if (oldPost.cover_image_url) {
            oldImages.add(oldPost.cover_image_url);
        }

        const oldContentFields = [
            oldPost.content,
            oldPost.content_ja,
            oldPost.content_en,
            oldPost.content_md,
            oldPost.content_ja_md,
            oldPost.content_en_md
        ];

        for (const content of oldContentFields) {
            const urls = this.extractImageUrls(content);
            urls.forEach(url => oldImages.add(url));
        }

        // Get all images from new post
        const newImages = new Set<string>();

        if (newPost.cover_image_url) {
            newImages.add(newPost.cover_image_url);
        }

        const newContentFields = [
            newPost.content,
            newPost.content_ja,
            newPost.content_en,
            newPost.content_md,
            newPost.content_ja_md,
            newPost.content_en_md
        ];

        for (const content of newContentFields) {
            const urls = this.extractImageUrls(content);
            urls.forEach(url => newImages.add(url));
        }

        // Find images that were removed (in old but not in new)
        const removedImages = [...oldImages].filter(url => !newImages.has(url));

        // Delete removed images
        if (removedImages.length > 0) {
            console.log(`🗑️ Removing ${removedImages.length} unused images from post update`);
            await this.deleteImages(removedImages);
        }
    }
};

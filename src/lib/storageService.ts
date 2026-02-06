import { supabase } from './supabaseClient';

export type StorageFolder = 'profiles' | 'businesses' | 'posts' | 'jobs' | 'events' | 'guides' | 'gallery' | 'media' | 'community' | 'logos' | 'covers' | 'documents';

export const storageService = {
    isProduction(): boolean {
        if (typeof window === 'undefined') return false; // Default to absolute URLs (dev mode logic) on server
        const hostname = window.location.hostname;
        return hostname === 'nippon-life.com' ||
            hostname === 'www.nippon-life.com' ||
            hostname === 'nippon-life.net' ||
            hostname === 'www.nippon-life.net' ||
            hostname.includes('nipponlife') ||
            hostname.includes('nippon-life');
    },


    /**
     * Uploads a file.
     * In Production (when on nippon-life.com or similar), it uses the local PHP handler.
     * In Development, it falls back to Supabase Storage.
     * 
     * @param file - The file to upload
     * @param folder - The storage folder category
     * @param userId - Optional user ID for organizing files by user (especially for gallery)
     * @param albumId - Optional album ID for organizing gallery photos by album
     */
    async uploadFile(file: File, folder: StorageFolder, userId?: string, albumId?: string): Promise<string> {
        return this.uploadToSupabase(file, folder);
    },

    /**
     * Upload to the PHP handler on the ColorfulBox server
     */
    async uploadToLocalAPI(file: File, folder: StorageFolder, userId?: string, albumId?: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        // Add userId and albumId for better organization (especially for gallery)
        if (userId) {
            formData.append('userId', userId);
        }
        if (albumId) {
            formData.append('albumId', albumId);
        }

        try {
            const response = await fetch('/api/upload.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload to local server');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Local API Upload error:', error);
            // Fallback to Supabase if local API fails during transition
            console.log('Falling back to Supabase Storage...');
            return this.uploadToSupabase(file, folder);
        }
    },

    /**
     * Upload to Supabase Storage (Legacy/Development fallback)
     */
    async uploadToSupabase(file: File, folder: StorageFolder): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const bucket = folder === 'gallery' ? 'gallery' : 'media';

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    },

    /**
     * Resolves a file path to a full public URL.
     * If the path is already a full URL (Supabase/External), it returns it.
     * If it's a relative path (Local API), it prepends the correct base URL.
     */
    getFileUrl(path: string | null | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('data:')) return path;
        if (path.startsWith('blob:')) return path;

        // Ensure path starts with / if it's relative
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Use Supabase URL structure or fallback to site URL if needed, 
        // but for now, we assume simple relative paths are likely legacy or local assets.
        // If it's a Supabase path, it usually comes full. 
        // If we need to prepend Site URL:
        return `${this.isProduction() ? '' : 'http://localhost:3000'}${cleanPath}`;
    },

    /**
     * Deletes a file.
     * In Production, it uses the local PHP handler.
     * In Development, it falls back to Supabase Storage.
     * 
     * @param path - The public path of the file (e.g., 'uploads/media/gallery/...')
     */
    async deleteFile(path: string | null | undefined): Promise<boolean> {
        if (!path) return true;

        if (path.includes('supabase.co')) {
            return this.deleteFromSupabase(path);
        }

        return true;
    },

    /**
     * Delete from the PHP handler on the ColorfulBox server
     */
    async deleteFromLocalAPI(path: string): Promise<boolean> {
        try {
            const response = await fetch('/api/upload.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Local API Delete error:', errorData.error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Local API Delete error:', error);
            return false;
        }
    },

    /**
     * Delete from Supabase Storage
     */
    async deleteFromSupabase(url: string): Promise<boolean> {
        try {
            // Extract bucket and path from URL
            // Format: .../storage/v1/object/public/bucket-name/folder/file.ext
            const parts = url.split('/public/');
            if (parts.length < 2) return false;

            const subparts = parts[1].split('/');
            const bucket = subparts[0];
            const filePath = subparts.slice(1).join('/');

            const { error } = await supabase.storage
                .from(bucket)
                .remove([filePath]);

            if (error) {
                console.error('Supabase Storage Delete error:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Supabase Storage Delete error:', error);
            return false;
        }
    }
};

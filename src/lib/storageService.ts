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
        const isProd = this.isProduction();

        // You can force PHP upload handler here for testing if the API is online
        // const useLocalAPI = true; 
        const useLocalAPI = isProd;

        if (useLocalAPI) {
            return this.uploadToLocalAPI(file, folder, userId, albumId);
        } else {
            return this.uploadToSupabase(file, folder);
        }
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

        // Handle absolute URLs - keep .com URLs as they are (DNS is configured for .com only)
        // Convert any .net URLs to .com since .net doesn't have DNS configured
        let targetPath = path;
        if (targetPath.startsWith('https://nippon-life.net/uploads')) {
            targetPath = targetPath.replace('nippon-life.net', 'nippon-life.com');
        }

        if (targetPath.startsWith('http')) return targetPath;
        if (targetPath.startsWith('data:')) return targetPath; // Base64
        if (targetPath.startsWith('blob:')) return targetPath; // Object URL

        // For relative paths, we need to know where they are hosted
        const isProd = this.isProduction();

        // Production base URL (ColorfulBox server) - use .com as it has DNS configured
        const baseUrl = isProd ? '' : 'https://nippon-life.com';

        // Ensure path starts with / if it's relative
        const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;

        return `${baseUrl}${cleanPath}`;
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

        const isProd = this.isProduction();
        const useLocalAPI = isProd;

        // If it's a full URL, try to extract the relative path
        let relativePath = path;
        if (path.includes('/uploads/')) {
            relativePath = 'uploads/' + path.split('/uploads/')[1];
        }

        if (useLocalAPI && relativePath.startsWith('uploads/')) {
            return this.deleteFromLocalAPI(relativePath);
        } else if (path.includes('supabase.co')) {
            // It's a Supabase URL, try to delete from Supabase storage
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

import { supabase } from '@/lib/supabaseClient';
import { GalleryPhoto, GalleryPhotoInsert, GalleryAlbum, GalleryAlbumInsert, GalleryAlbumWithStats } from '@/types/gallery';
import { storageService } from '@/lib/storageService';

export const galleryService = {
    // ===== PHOTOS =====
    async getPhotos(limit = 20, albumId?: string) {
        let query = supabase
            .from('gallery_photos')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (albumId) {
            query = query.eq('album_id', albumId);
        }

        const { data, error } = await query.limit(limit);
        if (error) throw error;
        return data as GalleryPhoto[];
    },

    async getUserPhotos(userId: string) {
        const { data, error } = await supabase
            .from('gallery_photos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as GalleryPhoto[];
    },

    async uploadPhoto(file: File, userId?: string, albumId?: string): Promise<string> {
        // userId and albumId are used to organize files in the ColorfulBox server
        // Files will be stored in: /uploads/media/gallery/user_{userId}/album_{albumId}/
        // storageService will handle the production/development routing
        try {
            return await storageService.uploadFile(file, 'gallery', userId, albumId);
        } catch (error) {
            console.error('Gallery Upload error:', error);
            throw error;
        }
    },

    async createPhoto(photo: GalleryPhotoInsert) {
        const { data, error } = await supabase
            .from('gallery_photos')
            .insert(photo)
            .select()
            .single();

        if (error) throw error;
        return data as GalleryPhoto;
    },

    async updatePhoto(id: string, updates: Partial<GalleryPhotoInsert>) {
        const { data, error } = await supabase
            .from('gallery_photos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as GalleryPhoto;
    },

    async deletePhoto(id: string) {
        // 1. Get photo data to find the image URL
        const { data: photo } = await supabase
            .from('gallery_photos')
            .select('image_url')
            .eq('id', id)
            .single();

        // 2. Delete file from storage server
        if (photo?.image_url) {
            try {
                await storageService.deleteFile(photo.image_url);
            } catch (err) {
                console.warn('Failed to delete file from storage, proceeding to delete record:', err);
            }
        }

        // 3. Delete record from database
        const { error } = await supabase
            .from('gallery_photos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ===== ALBUMS =====
    async getAlbums(userId?: string, showAll = false) {
        let query = supabase
            .from('gallery_album_stats')
            .select('*')
            .order('created_at', { ascending: false });

        if (showAll) {
            // No filters, get everything (for admins)
        } else if (userId) {
            // Get only user's own albums (dashboard view)
            query = query.eq('created_by', userId);
        } else {
            // Get only published albums (public feed)
            query = query.eq('status', 'published');
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as GalleryAlbumWithStats[];
    },

    async getAlbum(id: string) {
        const { data, error } = await supabase
            .from('gallery_album_stats')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as GalleryAlbumWithStats;
    },

    async incrementAlbumViews(id: string) {
        const { error } = await supabase
            .rpc('increment_album_view_count', { album_id: id });

        if (error) {
            console.error('Error incrementing album views:', error);
        }
    },

    async createAlbum(album: GalleryAlbumInsert, userId: string) {
        const { data, error } = await supabase
            .from('gallery_albums')
            .insert({ ...album, created_by: userId })
            .select()
            .single();

        if (error) throw error;
        return data as GalleryAlbum;
    },

    async updateAlbum(id: string, updates: Partial<GalleryAlbumInsert>) {
        const { data, error } = await supabase
            .from('gallery_albums')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as GalleryAlbum;
    },

    async deleteAlbum(id: string) {
        // 0. Clean cover_photo reference to avoid FK constraint issues
        await supabase
            .from('gallery_albums')
            .update({ cover_photo_id: null })
            .eq('id', id);

        // 1. Get all photos in the album
        const { data: photos } = await supabase
            .from('gallery_photos')
            .select('id, image_url')
            .eq('album_id', id);

        // 2. Delete each photo (files and records)
        if (photos && photos.length > 0) {
            for (const photo of photos) {
                try {
                    await this.deletePhoto(photo.id);
                } catch (err) {
                    console.error('Error deleting photo during album deletion:', err);
                }
            }
        }

        // 3. Delete the album record
        const { error } = await supabase
            .from('gallery_albums')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

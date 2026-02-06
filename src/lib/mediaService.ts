import { supabase } from './supabaseClient';
import { storageService } from './storageService';

const DB_TABLE = 'media';

export interface MediaItem {
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
}

export const mediaService = {
    async getMediaItems() {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((m: any) => ({
            id: m.id,
            url: m.public_url,
            name: m.path.split('/').pop() || m.path,
            type: m.mime_type,
            size: m.size_bytes,
            createdAt: m.created_at
        }));
    },

    async uploadMedia(file: File) {
        // First upload to storage
        const folder = 'gallery'; // Default folder for media library
        const publicUrl = await storageService.uploadFile(file, folder);

        if (!publicUrl) throw new Error('Failed to upload to storage');

        // Then record in DB
        const { data, error } = await supabase
            .from(DB_TABLE)
            .insert([{
                path: `${folder}/${file.name}`,
                public_url: publicUrl,
                mime_type: file.type,
                size_bytes: file.size
            }])
            .select()
            .single();

        if (error) throw error;
        return data as MediaItem;
    },

    async deleteMediaItem(id: string, publicUrl: string) {
        // 1. Delete from storage
        await storageService.deleteFile(publicUrl);

        // 2. Delete from DB
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

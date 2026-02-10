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
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'gallery')

            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to upload media')
            }

            const data = await response.json()
            return data as MediaItem
        } catch (error: any) {
            console.error('Error uploading media:', error)
            throw error
        }
    },

    async deleteMediaItem(id: string, publicUrl: string) {
        try {
            const response = await fetch('/api/media/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, publicUrl })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete media')
            }

            return true
        } catch (error: any) {
            console.error('Error deleting media:', error)
            throw error
        }
    }
};

"use client";

import { useState, useCallback } from 'react';
import { mediaService, MediaItem } from '@/lib/mediaService';
import { toast } from 'react-hot-toast';

export function useAdminMedia() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mediaService.getMediaItems();
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
            toast.error('Erro ao carregar mídia');
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadMedia = async (file: File) => {
        try {
            await mediaService.uploadMedia(file);
            toast.success('Mídia enviada');
            fetchMedia();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar mídia');
            return false;
        }
    };

    const deleteMedia = async (id: string, url: string) => {
        if (!window.confirm('Excluir este item permanentemente?')) return false;
        try {
            await mediaService.deleteMediaItem(id, url);
            toast.success('Mídia excluída');
            fetchMedia();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir mídia');
            return false;
        }
    };

    return {
        media,
        loading,
        fetchMedia,
        uploadMedia,
        deleteMedia
    };
}

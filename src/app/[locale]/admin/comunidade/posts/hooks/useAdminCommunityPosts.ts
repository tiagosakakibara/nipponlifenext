"use client";

import { useState, useCallback } from 'react';
import { communityService } from '@/lib/communityService';
import { toast } from 'react-hot-toast';

export function useAdminCommunityPosts() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await communityService.getAdminPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching community posts:', error);
            toast.error('Erro ao carregar posts da comunidade');
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePost = async (id: string) => {
        if (!window.confirm('Excluir este post permanentemente?')) return;
        try {
            await communityService.deletePost(id);
            toast.success('Post excluído');
            fetchPosts();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir post');
        }
    };

    return {
        posts,
        loading,
        fetchPosts,
        deletePost
    };
}

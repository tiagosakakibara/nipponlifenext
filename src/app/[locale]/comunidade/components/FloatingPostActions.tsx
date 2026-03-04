'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface FloatingPostActionsProps {
    postId: string;
    pageUrl: string;
    title: string;
}

export function FloatingPostActions({ postId, pageUrl, title }: FloatingPostActionsProps) {
    const t = useTranslations();
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            checkIfLiked();
        } else {
            setLoading(false);
        }
    }, [user, postId]);

    const checkIfLiked = async () => {
        try {
            const { data } = await supabase
                .from('community_likes')
                .select('id')
                .eq('target_id', postId)
                .eq('user_id', user?.id)
                .eq('target_type', 'post')
                .single();

            if (data) setIsLiked(true);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            toast.error(t('community.questions.loginToPublish', { defaultMessage: 'Faça login para interagir' }));
            return;
        }

        const previousState = isLiked;
        setIsLiked(!previousState);

        if (previousState) {
            await supabase
                .from('community_likes')
                .delete()
                .eq('target_id', postId)
                .eq('user_id', user.id)
                .eq('target_type', 'post');
        } else {
            await supabase
                .from('community_likes')
                .insert({
                    target_id: postId,
                    user_id: user.id,
                    target_type: 'post'
                });
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: pageUrl
                });
                await supabase.rpc('increment_post_share', { post_id: postId });
            } catch (err) { }
        } else {
            // Fallback: scroll to bottom share section or just copy link
            navigator.clipboard.writeText(pageUrl);
            toast.success(t('common.copyLink', { defaultMessage: 'Link copiado!' }));
        }
    };

    return (
        <aside className="hidden lg:flex flex-col gap-4 sticky top-24 self-start">
            <button
                onClick={handleNativeShare}
                className="w-12 h-12 rounded-full border border-app bg-surface flex items-center justify-center text-zinc-400 hover:text-[#D70F24] hover:border-[#D70F24]/30 transition-all shadow-sm group"
                title={t('common.share')}
            >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
                onClick={handleLike}
                disabled={loading}
                className={`w-12 h-12 rounded-full border border-app bg-surface flex items-center justify-center transition-all shadow-sm group ${isLiked
                    ? 'bg-red-50 border-red-200 text-[#D70F24]'
                    : 'text-zinc-400 hover:text-[#D70F24] hover:border-[#D70F24]/30 hover:bg-zinc-100/50'
                    }`}
                title={t('common.like')}
            >
                <ThumbsUp className={`w-5 h-5 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
            </button>
        </aside>
    );
}

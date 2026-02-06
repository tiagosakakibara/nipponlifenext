'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, Share2, Eye, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ShareActions } from '@/components/ShareActions';

interface PostInteractionsProps {
    postId: string;
    initialLikeCount: number;
    initialViewCount: number;
    initialShareCount: number;
    pageUrl: string;
    title: string;
}

export function PostInteractions({
    postId,
    initialLikeCount,
    initialViewCount,
    initialShareCount,
    pageUrl,
    title
}: PostInteractionsProps) {
    const t = useTranslations();
    const { user } = useAuth();
    const [likes, setLikes] = useState(initialLikeCount);
    const [shares, setShares] = useState(initialShareCount);
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
            const { data, error } = await supabase
                .from('community_likes')
                .select('id')
                .eq('target_id', postId)
                .eq('user_id', user?.id)
                .eq('target_type', 'post')
                .single();

            if (data) setIsLiked(true);
        } catch (error) {
            // Silently fail if not found
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
        const previousCount = likes;

        // Optimistic update
        setIsLiked(!previousState);
        setLikes(prev => previousState ? prev - 1 : prev + 1);

        if (previousState) {
            // Unlike
            const { error } = await supabase
                .from('community_likes')
                .delete()
                .eq('target_id', postId)
                .eq('user_id', user.id)
                .eq('target_type', 'post');

            if (error) {
                setIsLiked(previousState);
                setLikes(previousCount);
                toast.error(t('common.error'));
            }
        } else {
            // Like
            const { error } = await supabase
                .from('community_likes')
                .insert({
                    target_id: postId,
                    user_id: user.id,
                    target_type: 'post'
                });

            if (error) {
                setIsLiked(previousState);
                setLikes(previousCount);
                toast.error(t('common.error'));
            }
        }
    };

    const handleShareClick = async () => {
        // Increment share count in DB
        const { error } = await supabase.rpc('increment_post_share', { post_id: postId });
        if (!error) {
            setShares(prev => prev + 1);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Interaction Buttons Bar */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-8">
                <button
                    onClick={handleLike}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 px-3 py-1.5 border rounded-xl transition-all group min-w-[60px] ${isLiked
                            ? 'bg-red-50 border-red-200 text-[#D70F24]'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100'
                        }`}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : 'group-hover:text-[#D70F24]'}`} />
                    <span className={`text-xs font-bold ${isLiked ? 'text-[#D70F24]' : 'text-zinc-500'}`}>{likes}</span>
                </button>

                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl min-w-[60px]">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500">{initialViewCount}</span>
                </div>

                <div className="relative group/share">
                    <button
                        onClick={handleShareClick}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 transition-colors group min-w-[60px]"
                    >
                        <Share2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#D70F24]" />
                        <span className="text-xs font-bold text-zinc-500">{shares}</span>
                    </button>

                    {/* Share Dropdown on hover/click could be added here, but ShareActions is already available */}
                </div>
            </div>

            {/* Direct Share Icons */}
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
                    {t('common.share', { defaultMessage: 'Compartilhar' })}
                </span>
                <div onClick={handleShareClick}>
                    <ShareActions url={pageUrl} title={title} text={title} variant="inline" />
                </div>
            </div>
        </div>
    );
}

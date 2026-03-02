'use client';

import { MoreHorizontal, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { storageService } from '@/lib/storageService';
import { useTranslations } from 'next-intl';

interface PostCardProps {
    avatar: string;
    name: string;
    time: string;
    category: string;
    title: string;
    content: string;
    image?: string | null;
    tags: string[];
    likes: number;
    comments: number;
    views?: number;
    slug?: string;
    postId?: string;
    isLikedInitial?: boolean;
}

export function PostCard({ avatar, name, time, category, title, content, image, tags, likes, comments, views, slug, postId, isLikedInitial = false }: PostCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const t = useTranslations();
    const [isLiked, setIsLiked] = useState(isLikedInitial);
    const [likeCount, setLikeCount] = useState(likes);

    useEffect(() => {
        setIsLiked(isLikedInitial);
    }, [isLikedInitial]);

    useEffect(() => {
        setLikeCount(likes);
    }, [likes]);

    const handleNavigate = () => {
        if (slug) router.push(`/comunidade/${slug}`);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (!postId) return;

        // Optimistic UI
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            if (newLiked) {
                await supabase
                    .from('community_likes')
                    .insert({
                        user_id: user.id,
                        target_id: postId,
                        target_type: 'post'
                    });
            } else {
                await supabase
                    .from('community_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('target_id', postId)
                    .eq('target_type', 'post');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(!newLiked);
            setLikeCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    return (
        <article className={`bg-surface rounded-2xl border border-app p-6 mb-4 hover:shadow-sm transition-all duration-300 ${slug ? 'cursor-pointer' : ''}`} onClick={handleNavigate}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h3 className="font-['DM_Sans'] font-bold text-primary text-sm">{name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted">
                            <span>{time}</span>
                            <span>•</span>
                            <span className="font-medium text-[var(--nl-link)]">{category}</span>
                        </div>
                    </div>
                </div>
                <button className="text-muted hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="mb-4">
                <h2 className="font-['Montserrat'] font-bold text-lg text-primary mb-2 leading-tight">
                    {title}
                </h2>
                <p className="text-secondary text-sm leading-relaxed mb-4 whitespace-pre-line line-clamp-3">
                    {content}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {(tags || []).flatMap(t => t.split(',')).map((tag, idx) => {
                        const trimmedTag = tag.trim();
                        if (!trimmedTag) return null;
                        return (
                            <span
                                key={`${trimmedTag}-${idx}`}
                                className="px-3 py-1 bg-app border border-app text-[var(--nl-link)] text-xs font-medium rounded-full hover:bg-surface transition-colors cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {trimmedTag}
                            </span>
                        );
                    })}
                </div>

                {image && (
                    <div className="rounded-xl overflow-hidden mt-4 aspect-video">
                        <img src={storageService.getFileUrl(image)} alt="Post content" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-app" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-[#D70F24]' : 'text-muted hover:text-[#D70F24]'}`}
                    >
                        <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{likeCount}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (slug) router.push(`/comunidade/${slug}#comments`);
                        }}
                        className="flex items-center gap-2 text-muted hover:text-[var(--nl-link)] transition-colors group"
                        title={t('community.post.viewComments', { defaultMessage: 'Ver comentários' })}
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium">{comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted hover:text-[var(--nl-link)] transition-colors group cursor-default">
                        <Eye className="w-5 h-5" />
                        <span className="text-xs font-medium">{views || 0}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/comunidade/${slug}`;
                            if (typeof navigator !== 'undefined' && navigator.share) {
                                navigator.share({ title, text: content, url });
                            } else if (typeof navigator !== 'undefined') {
                                navigator.clipboard.writeText(url);
                                alert('Link copiado!');
                            }
                        }}
                        className="flex items-center gap-2 text-muted hover:text-[var(--nl-link)] transition-colors group"
                    >
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </article>
    );
}

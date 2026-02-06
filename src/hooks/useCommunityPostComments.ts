import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CommunityPostComment } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';

export function useCommunityPostComments(postId: string | undefined) {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommunityPostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [userLikedComments, setUserLikedComments] = useState<Set<string>>(new Set());

    const fetchComments = useCallback(async () => {
        if (!postId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('community_post_comments')
                .select(`
                    *,
                    author:profiles(username, full_name, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Manual Cast author if Supabase types return array
            const formattedData = (data || []).map(c => ({
                ...c,
                author: Array.isArray(c.author) ? c.author[0] : c.author
            })) as CommunityPostComment[];

            setComments(formattedData);

            // Check user likes
            if (user) {
                const { data: likesData } = await supabase
                    .from('community_likes')
                    .select('target_id')
                    .eq('user_id', user.id)
                    .eq('target_type', 'comment')
                    .in('target_id', formattedData.map(c => c.id));

                if (likesData) {
                    setUserLikedComments(new Set(likesData.map(l => l.target_id)));
                }
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    }, [postId, user]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const createComment = async (content: string) => {
        if (!postId || !user) return false;

        try {
            setCreating(true);
            const { error } = await supabase
                .from('community_post_comments')
                .insert({
                    post_id: postId,
                    author_id: user.id,
                    content
                });

            if (error) throw error;

            await fetchComments();
            return true;
        } catch (error) {
            console.error('Error creating comment:', error);
            return false;
        } finally {
            setCreating(false);
        }
    };

    const updateComment = async (commentId: string, content: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('community_post_comments')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', commentId)
                .eq('author_id', user.id);

            if (error) throw error;

            setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));
            return true;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('community_post_comments')
                .delete()
                .eq('id', commentId)
                .eq('author_id', user.id);

            if (error) throw error;

            setComments(prev => prev.filter(c => c.id !== commentId));
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    };

    const toggleCommentLike = async (commentId: string) => {
        if (!user) return false;

        const isLiked = userLikedComments.has(commentId);

        // Optimistic update
        const newSet = new Set(userLikedComments);
        if (isLiked) newSet.delete(commentId);
        else newSet.add(commentId);
        setUserLikedComments(newSet);

        // Update count optimistically
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    like_count: Math.max(0, c.like_count + (isLiked ? -1 : 1))
                };
            }
            return c;
        }));

        try {
            if (isLiked) {
                await supabase
                    .from('community_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('target_id', commentId)
                    .eq('target_type', 'comment');
            } else {
                await supabase
                    .from('community_likes')
                    .insert({
                        user_id: user.id,
                        target_id: commentId,
                        target_type: 'comment'
                    });
            }
            return true;
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setUserLikedComments(userLikedComments); // Revert set
            fetchComments(); // Revert counts
            return false;
        }
    };

    return {
        comments,
        loading,
        creating,
        createComment,
        updateComment,
        deleteComment,
        toggleCommentLike,
        userLikedComments,
        refreshComments: fetchComments
    };
}

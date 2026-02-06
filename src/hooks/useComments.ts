import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    like_count: number;
    created_at: string;
    updated_at: string;
    author: {
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

export function useComments(postId: string | undefined, tableName: string = 'post_comments', likesTableName: string = 'post_comment_likes') {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [userLikedComments, setUserLikedComments] = useState<Set<string>>(new Set());

    const fetchComments = useCallback(async () => {
        if (!postId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from(tableName)
                .select(`
                    *,
                    author:profiles!author_id(username, full_name, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Safe cast since we know the shape, but handle potential nulls in UI
            setComments((data as any) || []);

            // Check user likes
            if (user && data && data.length > 0) {
                const { data: likesData } = await supabase
                    .from(likesTableName)
                    .select('comment_id')
                    .eq('user_id', user.id)
                    .in('comment_id', data.map(c => c.id));

                if (likesData) {
                    setUserLikedComments(new Set(likesData.map(l => l.comment_id)));
                }
            }
        } catch (error) {
            console.error(`Error fetching comments from ${tableName}:`, error);
        } finally {
            setLoading(false);
        }
    }, [postId, user, tableName, likesTableName]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const createComment = async (content: string) => {
        if (!postId || !user) return false;

        try {
            setCreating(true);
            const { error } = await supabase
                .from(tableName)
                .insert({
                    post_id: postId,
                    author_id: user.id,
                    content
                });

            if (error) throw error;

            await fetchComments();
            return true;
        } catch (error) {
            console.error(`Error creating comment in ${tableName}:`, error);
            return false;
        } finally {
            setCreating(false);
        }
    };

    const updateComment = async (commentId: string, content: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from(tableName)
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', commentId)
                .eq('author_id', user.id);

            if (error) throw error;

            setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));
            return true;
        } catch (error) {
            console.error(`Error updating comment in ${tableName}:`, error);
            return false;
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', commentId)
                .eq('author_id', user.id);

            if (error) throw error;

            setComments(prev => prev.filter(c => c.id !== commentId));
            return true;
        } catch (error) {
            console.error(`Error deleting comment from ${tableName}:`, error);
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
                    .from(likesTableName)
                    .delete()
                    .eq('user_id', user.id)
                    .eq('comment_id', commentId);
            } else {
                await supabase
                    .from(likesTableName)
                    .insert({
                        user_id: user.id,
                        comment_id: commentId
                    });
            }
            return true;
        } catch (error) {
            console.error(`Error toggling like in ${likesTableName}:`, error);
            // Revert on error
            fetchComments();
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

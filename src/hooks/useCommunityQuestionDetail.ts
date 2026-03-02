import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CommunityQuestion, CommunityAnswer } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';

interface UseCommunityQuestionDetailResult {
    question: CommunityQuestion | null;
    answers: CommunityAnswer[];
    loading: boolean;
    loadingAnswers: boolean;
    error: Error | null;
    notFound: boolean;
    createAnswer: (body: string) => Promise<boolean>;
    creatingAnswer: boolean;
    refetchAnswers: () => Promise<void>;
    toggleLike: () => Promise<boolean>;
    toggleAnswerLike: (answerId: string) => Promise<boolean>;
    incrementShare: () => Promise<void>;
    userLiked: boolean;
    userLikedAnswers: Set<string>;
    updateAnswer: (answerId: string, body: string) => Promise<boolean>;
    deleteAnswer: (answerId: string) => Promise<boolean>;
    updateQuestion: (params: Partial<{ title: string; body: string; category: string }>) => Promise<boolean>;
    deleteQuestion: () => Promise<boolean>;
}

export function useCommunityQuestionDetail(
    slug: string,
    initialQuestion?: CommunityQuestion | null,
    initialAnswers?: CommunityAnswer[]
): UseCommunityQuestionDetailResult {
    const { user } = useAuth();
    const [question, setQuestion] = useState<CommunityQuestion | null>(initialQuestion || null);
    const [answers, setAnswers] = useState<CommunityAnswer[]>(initialAnswers || []);
    const [loading, setLoading] = useState(!initialQuestion);
    const [loadingAnswers, setLoadingAnswers] = useState(!initialAnswers);
    const [error, setError] = useState<Error | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [creatingAnswer, setCreatingAnswer] = useState(false);
    const [userLiked, setUserLiked] = useState(false);
    const [userLikedAnswers, setUserLikedAnswers] = useState<Set<string>>(new Set());

    // Fetch question by slug (if not provided or strictly needed to refresh)
    const fetchQuestion = useCallback(async () => {
        if (!slug) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        // If we have initial question, we might still want to check likes, but skip main fetch?
        // Logic: if initialQuestion is present, we only check user likes.
        // But if we want to support real-time updates or refetch, we might fetch.
        // For now, assume if initialQuestion is passed, we use it. 
        // We only fetch if question is null.

        try {
            if (!question) {
                setLoading(true);
                setError(null);
                setNotFound(false);

                const { data, error: queryError } = await supabase
                    .from('community_questions')
                    .select(`
                        *,
                        author:profiles(username, full_name, avatar_url)
                    `)
                    .eq('slug', slug)
                    .eq('status', 'active')
                    .single();

                if (queryError) {
                    if (queryError.code === 'PGRST116') {
                        setNotFound(true);
                        setQuestion(null);
                    } else {
                        throw new Error(queryError.message);
                    }
                } else {
                    // Normalize author logic if array
                    const normalizedQuestion = {
                        ...data,
                        body: data.content || data.body,
                        author: Array.isArray(data.author) ? data.author[0] : data.author
                    };
                    setQuestion(normalizedQuestion as CommunityQuestion);
                }
            }

            // Check user likes
            if (user && (question || initialQuestion)) {
                const qId = question?.id || initialQuestion?.id;
                if (qId) {
                    const { data: likeData } = await supabase
                        .from('community_likes')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('target_id', qId)
                        .eq('target_type', 'question')
                        .maybeSingle();

                    setUserLiked(!!likeData);
                }
            }
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error fetching question:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch question'));
        } finally {
            setLoading(false);
        }
    }, [slug, user, question /* depends on question state to skip fetch if present */]);

    // Fetch answers
    const fetchAnswers = useCallback(async () => {
        const qId = question?.id || initialQuestion?.id;
        if (!qId) {
            if (!loading) { // Only stop if question loading finished and no ID found
                setAnswers([]);
                setLoadingAnswers(false);
            }
            return;
        }

        try {
            // If we have initial answers, we might skip fetching unless explicitly refreshing?
            // But we need to check likes.
            if (!answers.length && !initialAnswers) {
                setLoadingAnswers(true);
                const { data, error: queryError } = await supabase
                    .from('community_answers')
                    .select(`
                        *,
                        author:profiles(username, full_name, avatar_url)
                    `)
                    .eq('question_id', qId)
                    .eq('status', 'active')
                    .order('created_at', { ascending: true });

                if (queryError) {
                    throw new Error(queryError.message);
                }

                const normalizedAnswers = (data || []).map(a => ({
                    ...a,
                    body: a.content || a.body,
                    author: Array.isArray(a.author) ? a.author[0] : a.author
                }));
                setAnswers(normalizedAnswers as CommunityAnswer[]);
            }

            // Check which answers user liked
            if (user && (answers.length > 0 || (initialAnswers && initialAnswers.length > 0))) {
                const currentAnswers = answers.length > 0 ? answers : (initialAnswers || []);
                const answerIds = currentAnswers.map(a => a.id);

                const { data: likesData } = await supabase
                    .from('community_likes')
                    .select('target_id')
                    .eq('user_id', user.id)
                    .eq('target_type', 'answer')
                    .in('target_id', answerIds);

                if (likesData) {
                    setUserLikedAnswers(new Set(likesData.map(l => l.target_id)));
                }
            }
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error fetching answers:', err);
        } finally {
            setLoadingAnswers(false);
        }
    }, [question?.id, initialQuestion?.id, user, answers.length, initialAnswers]);

    // Like Toggle
    const toggleLike = async (): Promise<boolean> => {
        const q = question || initialQuestion;
        if (!q?.id) return false;
        if (!user) return false;

        try {
            if (userLiked) {
                await supabase
                    .from('community_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('target_id', q.id)
                    .eq('target_type', 'question');
                setUserLiked(false);
                setQuestion(prev => prev ? { ...prev, like_count: Math.max(0, (prev.like_count || 0) - 1) } : null);
            } else {
                await supabase
                    .from('community_likes')
                    .insert({
                        user_id: user.id,
                        target_id: q.id,
                        target_type: 'question'
                    });
                setUserLiked(true);
                setQuestion(prev => prev ? { ...prev, like_count: (prev.like_count || 0) + 1 } : null);
            }
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error toggling like:', err);
            return false;
        }
    };

    const toggleAnswerLike = async (answerId: string): Promise<boolean> => {
        if (!user) return false;

        const isLiked = userLikedAnswers.has(answerId);

        try {
            if (isLiked) {
                await supabase
                    .from('community_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('target_id', answerId)
                    .eq('target_type', 'answer');

                const newLiked = new Set(userLikedAnswers);
                newLiked.delete(answerId);
                setUserLikedAnswers(newLiked);

                setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, like_count: Math.max(0, (a.like_count || 0) - 1) } : a));
            } else {
                await supabase
                    .from('community_likes')
                    .insert({
                        user_id: user.id,
                        target_id: answerId,
                        target_type: 'answer'
                    });

                const newLiked = new Set(userLikedAnswers);
                newLiked.add(answerId);
                setUserLikedAnswers(newLiked);

                setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, like_count: (a.like_count || 0) + 1 } : a));
            }
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error toggling answer like:', err);
            return false;
        }
    };

    const incrementShare = async () => {
        const q = question || initialQuestion;
        if (!q?.id) return;
        try {
            await supabase.rpc('increment_question_share', { question_id: q.id });
            setQuestion(prev => prev ? { ...prev, share_count: (prev.share_count || 0) + 1 } : null);
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error incrementing share:', err);
        }
    };

    const createAnswer = async (body: string): Promise<boolean> => {
        const q = question || initialQuestion;
        if (!q?.id) {
            setError(new Error('No question loaded'));
            return false;
        }

        if (!user) {
            setError(new Error('You must be logged in to answer'));
            return false;
        }

        setCreatingAnswer(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('community_answers')
                .insert({
                    question_id: q.id,
                    author_id: user.id,
                    content: body,
                });

            if (insertError) {
                throw new Error(insertError.message);
            }

            // Refresh answers - Force Fetch?
            // Since we rely on manual state for answers, we should re-fetch.
            // How to force refetch?
            // Make fetchAnswers depend on a refresh trigger or manually call.
            // We can manually call simple fetch logic here or update fetchAnswers to accommodate force.
            // Simpler: Just fetch answers again manually here.

            const { data } = await supabase
                .from('community_answers')
                .select(`*, author:profiles(username, full_name, avatar_url)`)
                .eq('question_id', q.id)
                .eq('status', 'active')
                .order('created_at', { ascending: true });

            if (data) {
                const normalizedAnswers = data.map(a => ({
                    ...a,
                    body: a.content || a.body,
                    author: Array.isArray(a.author) ? a.author[0] : a.author
                }));
                setAnswers(normalizedAnswers as CommunityAnswer[]);
            }

            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error creating answer:', err);
            setError(err instanceof Error ? err : new Error('Failed to create answer'));
            return false;
        } finally {
            setCreatingAnswer(false);
        }
    };

    // ... updateAnswer, deleteAnswer, updateQuestion, deleteQuestion implementation similar to before ...
    const updateAnswer = async (answerId: string, body: string): Promise<boolean> => {
        if (!user) return false;
        try {
            const { error: updateError } = await supabase
                .from('community_answers')
                .update({ content: body, updated_at: new Date().toISOString() })
                .eq('id', answerId)
                .eq('author_id', user.id);

            if (updateError) throw updateError;
            setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, body } : a));
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error updating answer:', err);
            return false;
        }
    };

    const deleteAnswer = async (answerId: string): Promise<boolean> => {
        if (!user) return false;
        try {
            const { error: deleteError } = await supabase
                .from('community_answers')
                .delete()
                .eq('id', answerId)
                .eq('author_id', user.id);

            if (deleteError) throw deleteError;
            setAnswers(prev => prev.filter(a => a.id !== answerId));
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error deleting answer:', err);
            return false;
        }
    };

    const updateQuestion = async (params: Partial<{ title: string; body: string; category: string }>): Promise<boolean> => {
        const q = question || initialQuestion;
        if (!q?.id) return false;
        if (!user || user.id !== q.author_id) return false;

        try {
            const updateData: any = { updated_at: new Date().toISOString() };
            if (params.title) updateData.title = params.title;
            if (params.body) updateData.content = params.body;


            if (params.category) updateData.category = params.category;

            const { error: updateError } = await supabase
                .from('community_questions')
                .update(updateData)
                .eq('id', q.id);

            if (updateError) throw updateError;

            // Refresh
            setQuestion(prev => prev ? { ...prev, ...params } : null);
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error updating question:', err);
            return false;
        }
    };

    const deleteQuestion = async (): Promise<boolean> => {
        const q = question || initialQuestion;
        if (!q?.id) return false;
        if (!user || user.id !== q.author_id) return false;

        try {
            // Delete question usually cascades answers if configured in DB.
            // If not, we might error. Assuming cascade.
            const { error: deleteError } = await supabase
                .from('community_questions')
                .delete()
                .eq('id', q.id);

            if (deleteError) throw deleteError;
            return true;
        } catch (err) {
            console.error('[useCommunityQuestionDetail] Error deleting question:', err);
            return false;
        }
    };

    // Initial fetch effects
    useEffect(() => {
        // Only fetch if no initial question
        if (!initialQuestion) {
            fetchQuestion();
        } else if (user) {
            // Just check likes if initial question + user
            // Logic inside fetchQuestion handles it if we call it?
            // fetchQuestion checks `!question`. If `question` is set (from initial), it skips fetch but does keys check.
            fetchQuestion();
        }
    }, [initialQuestion, fetchQuestion, user]);

    useEffect(() => {
        if ((question?.id || initialQuestion?.id) && (!initialAnswers || user)) {
            // Fetch answers if not provided OR if user logged in (to check likes)
            // fetchAnswers skips fetch if answers present, but checks likes.
            fetchAnswers();
        }
    }, [question?.id, initialQuestion?.id, fetchAnswers, initialAnswers, user]);

    return {
        question,
        answers,
        loading,
        loadingAnswers,
        error,
        notFound,
        createAnswer,
        creatingAnswer,
        refetchAnswers: fetchAnswers,
        toggleLike,
        toggleAnswerLike,
        incrementShare,
        userLiked,
        userLikedAnswers,
        updateAnswer,
        deleteAnswer,
        updateQuestion,
        deleteQuestion
    };
}

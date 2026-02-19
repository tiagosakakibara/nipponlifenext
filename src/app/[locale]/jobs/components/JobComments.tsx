"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/lib/jobsService';
import { JobComment } from '@/types/job';
import { Send, User as UserIcon, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, ja } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import toast from 'react-hot-toast';

interface JobCommentsProps {
    jobId: string;
}

export function JobComments({ jobId }: JobCommentsProps) {
    const t = useTranslations('jobs.comments');
    const { user, profile, loading: authLoading } = useAuth();
    const locale = useLocale();

    const [comments, setComments] = useState<JobComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const dateLocale = locale === 'pt' ? ptBR : locale === 'ja' ? ja : enUS;

    useEffect(() => {
        loadComments();
    }, [jobId]);

    const loadComments = async () => {
        try {
            const data = await jobsService.getComments(jobId);
            setComments(data);
        } catch (error) {
            console.error(error);
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setSubmitting(true);
        try {
            const addedComment = await jobsService.addComment(jobId, newComment, user.id);
            if (addedComment) {
                setComments([addedComment, ...comments]);
                setNewComment('');
                toast.success(t('success'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-xl font-heading font-black text-primary tracking-tight uppercase">
                    {t('title')} ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-surface border border-app rounded-2xl p-4 shadow-sm mb-8">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || user.email || ''}
                                    className="w-10 h-10 rounded-full object-cover border border-app"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-app flex items-center justify-center border border-app text-secondary">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('placeholder')}
                                className="w-full bg-app/50 border border-app rounded-xl p-3 min-h-[100px] text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {t('submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3 h-3" />
                                            {t('submit')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-surface border border-app rounded-2xl p-8 text-center mb-8">
                    <div className="w-16 h-16 bg-app rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-6 h-6 text-secondary/40" />
                    </div>
                    <p className="text-secondary font-bold text-sm max-w-md mx-auto">
                        {t('loginToComment')}
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-secondary/40 italic">
                        {t('empty')}
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 animate-fade-in">
                            <div className="shrink-0">
                                {comment.author?.avatar_url ? (
                                    <img
                                        src={comment.author.avatar_url}
                                        alt={comment.author.full_name || ''}
                                        className="w-10 h-10 rounded-full object-cover border border-app shadow-sm"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-surface border border-app flex items-center justify-center text-secondary/40 shadow-sm">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-surface border border-app rounded-2xl rounded-tl-none p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-primary text-sm">
                                        {comment.author?.full_name || 'Usuário'}
                                        <span className="ml-2 text-xs font-normal text-secondary/40">@{comment.author?.username}</span>
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-secondary/40 tracking-wider">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
                                    </span>
                                </div>
                                <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

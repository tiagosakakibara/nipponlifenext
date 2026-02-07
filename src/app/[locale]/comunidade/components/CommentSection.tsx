'use client';

import { useState, useRef, useEffect, FormEvent, MouseEvent } from 'react';
import { useCommunityPostComments } from '@/hooks/useCommunityPostComments';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { Send, Heart, User, MoreHorizontal, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, ja } from 'date-fns/locale';
import { Link, useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { comments, loading, createComment, updateComment, deleteComment, toggleCommentLike, userLikedComments } = useCommunityPostComments(postId);
    const { user } = useAuth();
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Click outside to close menu
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: globalThis.MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getDateLocale = () => {
        switch (locale) {
            case 'pt-br': return ptBR;
            case 'en': return enUS;
            case 'ja': return ja;
            default: return ptBR;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            // router.push('/login?from=' + window.location.pathname);
            router.push('/login');
            return;
        }

        setSubmitting(true);
        const success = await createComment(newComment);
        setSubmitting(false);

        if (success) {
            setNewComment('');
            toast.success(t('common.comments.posted', { defaultMessage: 'Comentário enviado!' }));
        } else {
            toast.error(t('common.error', { defaultMessage: 'Erro ao enviar comentário.' }));
        }
    };

    const handleLike = async (commentId: string) => {
        if (!user) {
            router.push('/login');
            return;
        }
        await toggleCommentLike(commentId);
    };

    const handleEditStart = (comment: any) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
        setOpenMenuId(null);
    };

    const handleEditSave = async () => {
        if (!editingId || !editContent.trim()) return;

        const success = await updateComment(editingId, editContent);
        if (success) {
            setEditingId(null);
            setEditContent('');
            toast.success(t('common.saved', { defaultMessage: 'Salvo com sucesso!' }));
        } else {
            toast.error(t('common.error', { defaultMessage: 'Erro ao salvar.' }));
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleDelete = async (commentId: string) => {
        if (window.confirm(t('common.confirmDelete', { defaultMessage: 'Tem certeza que deseja excluir?' }))) {
            const success = await deleteComment(commentId);
            if (success) {
                toast.success(t('common.deleted', { defaultMessage: 'Excluído com sucesso!' }));
            } else {
                toast.error(t('common.error', { defaultMessage: 'Erro ao excluir.' }));
            }
        }
        setOpenMenuId(null);
    };

    return (
        <div id="comments" className="mt-16 pt-12 border-t border-app">
            <h3 className="text-2xl font-black text-primary mb-8 font-display flex items-center gap-3">
                <div className="w-2 h-8 bg-[#D70F24]" />
                {t('community.answerPage.respostas', { defaultMessage: 'Respostas' })} ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="mb-12 bg-surface border border-app rounded-2xl p-6 shadow-sm">
                {!user ? (
                    <div className="text-center py-6">
                        <p className="text-muted mb-4">{t('community.questions.loginToPublish', { defaultMessage: 'Faça login para comentar' })}</p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#D70F24] text-white rounded-xl text-sm font-bold hover:bg-[#b50d1f] transition-all shadow-lg shadow-[#D70F24]/20"
                        >
                            {t('auth.login', { defaultMessage: 'Login' })}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface border border-app flex items-center justify-center shrink-0 overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-muted" />
                                )}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={t('community.answerPage.replyPlaceholder', { defaultMessage: 'Escreva um comentário...' })}
                                    className="w-full bg-background border border-app rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-[#D70F24]/50 focus:ring-1 focus:ring-[#D70F24]/50 transition-all resize-y text-sm"
                                    required
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={submitting || !newComment.trim()}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D70F24] text-white rounded-xl text-sm font-bold hover:bg-[#b50d1f] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#D70F24]/20"
                                    >
                                        {submitting ? (
                                            <span className="animate-pulse">{t('community.answerPage.enviando', { defaultMessage: 'Enviando...' })}</span>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                {t('community.answerPage.enviarResposta', { defaultMessage: 'Enviar' })}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-800" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-surface/50 rounded-2xl border border-dashed border-app">
                    <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                    <p className="text-muted font-medium">{t('community.answerPage.nenhumaResposta', { defaultMessage: 'Nenhum comentário ainda.' })}</p>
                    <p className="text-sm text-muted/60 mt-1">{t('community.answerPage.ajudePrimeiro', { defaultMessage: 'Seja o primeiro a comentar!' })}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-4 p-6 bg-surface border border-app rounded-2xl hover:border-[#D70F24]/20 transition-all">
                            <div className="w-10 h-10 rounded-full bg-surface border border-app flex items-center justify-center shrink-0 overflow-hidden">
                                {comment.author?.avatar_url ? (
                                    <img src={comment.author.avatar_url} alt={comment.author.username || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-muted" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2 relative">
                                    <div>
                                        <span className="font-bold text-primary block text-sm">
                                            {comment.author?.full_name || comment.author?.username || t('community.questions.anonymous', { defaultMessage: 'Anônimo' })}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: getDateLocale() })}
                                        </span>
                                    </div>

                                    {/* Action Menu (Edit/Delete) */}
                                    {user && user.id === comment.author_id && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                                                className="text-muted hover:text-primary p-1 rounded-lg hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label="Opções"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {openMenuId === comment.id && (
                                                <div ref={menuRef} className="absolute right-0 top-6 w-32 bg-surface border border-app rounded-lg shadow-lg z-10 py-1">
                                                    <button
                                                        onClick={() => handleEditStart(comment)}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-secondary hover:bg-app text-left"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        {t('common.edit', { defaultMessage: 'Editar' })}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-500 hover:bg-app text-left"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        {t('common.delete', { defaultMessage: 'Apagar' })}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {editingId === comment.id ? (
                                    <div className="mb-4">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-background border border-app rounded-lg p-3 text-sm focus:outline-none focus:border-[#D70F24]"
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={handleEditCancel}
                                                className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary"
                                            >
                                                {t('common.cancel', { defaultMessage: 'Cancelar' })}
                                            </button>
                                            <button
                                                onClick={handleEditSave}
                                                className="px-3 py-1.5 bg-[#D70F24] text-white rounded-lg text-xs font-medium hover:bg-[#b50d1f]"
                                            >
                                                {t('common.save', { defaultMessage: 'Salvar' })}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert prose-sm max-w-none mb-4 text-secondary leading-relaxed whitespace-pre-line">
                                        <p>{comment.content}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleLike(comment.id)}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${userLikedComments.has(comment.id) ? 'text-[#D70F24]' : 'text-muted hover:text-[#D70F24]'}`}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${userLikedComments.has(comment.id) ? 'fill-current' : ''}`} />
                                        <span>{comment.like_count || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

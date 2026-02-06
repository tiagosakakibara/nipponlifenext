'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal, Edit2, Trash2, Heart, MessageCircle } from 'lucide-react';
import { CommunityAnswer } from '@/types/community';
import toast from 'react-hot-toast';

interface ReplyCardProps {
    answer: CommunityAnswer;
    isLiked: boolean;
    onToggleLike: (id: string) => void;
    onUpdate: (id: string, body: string) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    onReply: (authorName: string) => void;
    currentUser: any;
}

export function ReplyCard({ answer, isLiked, onToggleLike, onUpdate, onDelete, onReply, currentUser }: ReplyCardProps) {
    const t = useTranslations();
    const likeCount = answer.like_count || 0;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(answer.body);
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const authorName = (answer.author as any)?.full_name || (answer.author as any)?.username || t('community.questions.anonymous', { defaultMessage: 'Anônimo' });
    const avatarUrl = (answer.author as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return t('community.questions.time.now', { defaultMessage: 'Agora' });
        if (diffInHours < 24) return t('community.questions.time.hours', { count: diffInHours });
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return t('community.questions.time.days', { count: diffInDays });
        const diffInMonths = Math.floor(diffInDays / 30);
        return t('community.questions.time.months', { count: diffInMonths });
    };

    const handleLike = () => {
        onToggleLike(answer.id);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        const success = await onUpdate(answer.id, editContent);
        if (success) {
            setIsEditing(false);
            toast.success(t('common.saved', { defaultMessage: 'Salvo com sucesso!' }));
        } else {
            toast.error(t('common.error', { defaultMessage: 'Erro ao salvar.' }));
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('admin.confirmDelete', { defaultMessage: 'Tem certeza?' }))) {
            const success = await onDelete(answer.id);
            if (success) {
                toast.success(t('common.deleted', { defaultMessage: 'Excluído com sucesso!' }));
            } else {
                toast.error(t('common.error', { defaultMessage: 'Erro ao excluir.' }));
            }
        }
    };

    return (
        <div className="bg-surface border border-app rounded-xl p-4 sm:p-5 group">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 object-cover" />
                <div className="flex-1 min-w-0 flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-primary text-sm">{authorName}</p>
                        <p className="text-muted text-xs">{t('community.answerPage.membroComunidade', { defaultMessage: 'Membro da Comunidade' })} • {getTimeAgo(answer.created_at)}</p>
                    </div>

                    {/* Actions Menu */}
                    {currentUser && currentUser.id === answer.author_id && (
                        <div className="relative">
                            <button
                                onClick={() => setOpenMenu(!openMenu)}
                                className="text-muted hover:text-primary p-1 rounded-lg hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {openMenu && (
                                <div ref={menuRef} className="absolute right-0 top-6 w-32 bg-surface border border-app rounded-lg shadow-lg z-10 py-1">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setOpenMenu(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-secondary hover:bg-app text-left"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        {t('common.edit', { defaultMessage: 'Editar' })}
                                    </button>
                                    <button
                                        onClick={handleDelete}
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
            </div>

            {/* Content */}
            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-background border border-app rounded-lg p-3 text-sm focus:outline-none focus:border-[#D70F24]"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(answer.body);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary"
                        >
                            {t('common.cancel', { defaultMessage: 'Cancelar' })}
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 bg-[#D70F24] text-white rounded-lg text-xs font-medium hover:bg-[#b50d1f]"
                        >
                            {t('common.save', { defaultMessage: 'Salvar' })}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-secondary text-sm leading-relaxed mb-4 whitespace-pre-line">
                    {answer.body}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? 'text-[#D70F24]' : 'text-muted hover:text-primary'}`}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{t('community.answerPage.curtir', { defaultMessage: 'Curtir' })} ({likeCount})</span>
                </button>
                <button
                    onClick={() => onReply(authorName)}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('community.answerPage.responder', { defaultMessage: 'Responder' })}</span>
                </button>
            </div>
        </div>
    );
}

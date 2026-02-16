'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityQuestionDetail } from '@/hooks/useCommunityQuestionDetail';
import { CommunityQuestion, CommunityAnswer, QUESTION_CATEGORY_COLORS } from '@/types/community';
import { Link, useRouter } from '@/i18n/routing';
import { ReplyCard } from '../../components/ReplyCard';
import { Home, ChevronRight, Share2, MessageCircle, Heart, Eye, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

// Simple Breadcrumb Component
function Breadcrumb({ category }: { category: string }) {
    const t = useTranslations();
    const getCategoryKey = (cat: string) => {
        if (!cat) return 'others';
        // Handle raw translation keys (e.g., COMMUNITY.CATEGORIES.VISA or community.categories.visa)
        if (cat.toLowerCase().includes('community.categories.')) {
            return cat.split('.').pop()?.toLowerCase() || 'others';
        }
        // Handle mapped legacy values
        const MAP: Record<string, string> = {
            'Visto e imigração': 'visa',
            'Saúde e seguros': 'health',
            'Trabalho': 'work',
            'Moradia': 'housing',
            'Documentos e registros': 'documents',
            'Convivência e cultura': 'culture',
            'Outros': 'others'
        };
        return MAP[cat] || cat.toLowerCase();
    };

    const categoryKey = getCategoryKey(category);

    return (
        <nav className="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>{t('nav.home', { defaultMessage: 'Home' })}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/comunidade/duvidas" className="hover:text-primary transition-colors">
                {t('community.questions.title', { defaultMessage: 'Comunidade' })}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-secondary">{t(`community.categories.${categoryKey}`, { defaultMessage: category })}</span>
        </nav>
    );
}

export function QuestionDetailClient({ initialQuestion, initialAnswers }: { initialQuestion: CommunityQuestion, initialAnswers: CommunityAnswer[] }) {
    const t = useTranslations();
    const router = useRouter();
    const { user, profile } = useAuth();

    // Track View
    useEffect(() => {
        if (initialQuestion?.slug) {
            supabase.rpc('increment_question_view', { question_slug: initialQuestion.slug, x: 1 })
                .then(({ error }) => {
                    if (error) console.error('Error tracking view:', error);
                });
        }
    }, [initialQuestion?.slug]);

    // State for local interactions
    const [replyText, setReplyText] = useState('');
    const [activeSort, setActiveSort] = useState<'recent' | 'voted'>('recent');
    const replyFormRef = useRef<HTMLDivElement>(null);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    // Edit Question State
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [editTitle, setEditTitle] = useState(initialQuestion.title);
    const [editBody, setEditBody] = useState(initialQuestion.body);
    const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
    const questionMenuRef = useRef<HTMLDivElement>(null);

    // Main Hook
    const {
        question, answers, loading, loadingAnswers, notFound,
        createAnswer, creatingAnswer,
        toggleLike, toggleAnswerLike,
        userLiked, userLikedAnswers,
        updateAnswer, deleteAnswer,
        updateQuestion, deleteQuestion
    } = useCommunityQuestionDetail(initialQuestion.slug, initialQuestion, initialAnswers);

    // Track View
    useEffect(() => {
        if (initialQuestion?.slug) {
            supabase.rpc('increment_question_view', { question_slug: initialQuestion.slug })
                .then(({ error }) => {
                    if (error) console.error('Error tracking view:', error);
                });
        }
    }, [initialQuestion?.slug]);

    // Handle clicks outside menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (questionMenuRef.current && !questionMenuRef.current.contains(event.target as Node)) {
                setOpenQuestionMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Derived state
    const currentQuestion = question || initialQuestion;
    const authorName = (currentQuestion.author as any)?.full_name || (currentQuestion.author as any)?.username || t('community.questions.anonymous', { defaultMessage: 'Anônimo' });
    const avatarUrl = (currentQuestion.author as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;
    const getCategoryKey = (cat: string) => {
        if (!cat) return 'others';
        // Handle raw translation keys (e.g., COMMUNITY.CATEGORIES.VISA or community.categories.visa)
        if (cat.toLowerCase().includes('community.categories.')) {
            return cat.split('.').pop()?.toLowerCase() || 'others';
        }
        const MAP: Record<string, string> = {
            'Visto e imigração': 'visa',
            'Saúde e seguros': 'health',
            'Trabalho': 'work',
            'Moradia': 'housing',
            'Documentos e registros': 'documents',
            'Convivência e cultura': 'culture',
            'Outros': 'others'
        };
        return MAP[cat] || cat.toLowerCase();
    };
    const categoryKey = getCategoryKey(currentQuestion.category || '');
    const categoryColor = QUESTION_CATEGORY_COLORS[(currentQuestion.category as keyof typeof QUESTION_CATEGORY_COLORS)] || 'bg-gray-500';

    // Sorting answers
    const sortedAnswers = [...answers].sort((a, b) => {
        if (activeSort === 'voted') {
            return (b.like_count || 0) - (a.like_count || 0);
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // oldest first usually for threads, or newest? Old code used 'created_at' in fetch order ascending.
    });

    // Handlers
    const handleToggleLike = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        await toggleLike();
    };

    const handleShare = async () => {
        const shareData = {
            title: currentQuestion.title,
            text: currentQuestion.body.substring(0, 100) + '...',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success(t('common.linkCopied', { defaultMessage: 'Link copiado!' }));
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleReplySubmit = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!replyText.trim()) {
            toast.error(t('community.answerPage.emptyReplyError', { defaultMessage: 'Escreva uma resposta.' }));
            return;
        }

        const success = await createAnswer(replyText.trim());
        if (success) {
            toast.success(t('community.answerPage.success', { defaultMessage: 'Resposta enviada!' }));
            setReplyText('');
        } else {
            toast.error(t('community.answerPage.error', { defaultMessage: 'Erro ao enviar.' }));
        }
    };

    const handleUpdateQuestion = async () => {
        if (!editTitle.trim() || !editBody.trim()) return;
        const success = await updateQuestion({
            title: editTitle,
            body: editBody,
            // category: editCategory // removed category for simplicity or add select back
        });
        if (success) {
            setIsEditingQuestion(false);
            toast.success(t('common.saved', { defaultMessage: 'Salvo!' }));
        } else {
            toast.error(t('common.error', { defaultMessage: 'Erro ao salvar.' }));
        }
    };

    const handleDeleteQuestion = async () => {
        if (window.confirm(t('admin.confirmDelete', { defaultMessage: 'Tem certeza?' }))) {
            const success = await deleteQuestion();
            if (success) {
                toast.success(t('common.deleted', { defaultMessage: 'Excluído!' }));
                router.push('/comunidade/duvidas');
            } else {
                toast.error(t('common.error', { defaultMessage: 'Erro ao excluir.' }));
            }
        }
    };

    const handleScrollToReply = () => {
        replyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
        replyInputRef.current?.focus();
    };

    const getTimeAgo = (date: string) => {
        // ... reuse helper or implement
        return new Date(date).toLocaleDateString(); // simplified for now or copy helper
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
            <Breadcrumb category={currentQuestion.category || 'Geral'} />

            {/* ===== QUESTION CARD ===== */}
            <div className="bg-surface border border-app rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">
                {/* Author Header */}
                <div className="flex items-start gap-3 mb-4">
                    <img
                        src={avatarUrl}
                        alt={authorName}
                        className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        {isEditingQuestion ? (
                            <div className="space-y-4 mb-4">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-app rounded-xl bg-app text-primary font-heading font-bold"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="font-heading font-bold text-primary text-lg sm:text-xl leading-tight mb-1">
                                    {currentQuestion.title}
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
                                    <span className="font-medium text-secondary">{authorName}</span>
                                    <span>•</span>
                                    <span>{new Date(currentQuestion.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className={`${categoryColor} text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
                                        {t(`community.categories.${categoryKey}`, { defaultMessage: currentQuestion.category || 'Geral' })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Question Menu */}
                    {user && user.id === currentQuestion.author_id && !isEditingQuestion && (
                        <div className="relative">
                            <button
                                onClick={() => setOpenQuestionMenu(!openQuestionMenu)}
                                className="text-muted hover:text-primary p-2 rounded-lg hover:bg-app transition-colors"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {openQuestionMenu && (
                                <div ref={questionMenuRef} className="absolute right-0 top-10 w-40 bg-surface border border-app rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            setIsEditingQuestion(true);
                                            setOpenQuestionMenu(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-secondary hover:bg-app text-left"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {t('common.edit', { defaultMessage: 'Editar' })}
                                    </button>
                                    <button
                                        onClick={handleDeleteQuestion}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-app text-left"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t('common.delete', { defaultMessage: 'Apagar' })}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Question Content */}
                <div className="mb-6">
                    {isEditingQuestion ? (
                        <div className="space-y-4">
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="w-full px-4 py-3 border border-app rounded-xl bg-app text-primary text-sm min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsEditingQuestion(false);
                                        setEditTitle(currentQuestion.title);
                                        setEditBody(currentQuestion.body);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
                                >
                                    {t('common.cancel', { defaultMessage: 'Cancelar' })}
                                </button>
                                <button
                                    onClick={handleUpdateQuestion}
                                    className="px-6 py-2 bg-[#D70F24] hover:bg-[#b80d1f] text-white font-semibold text-sm rounded-xl transition-colors"
                                >
                                    {t('common.save', { defaultMessage: 'Salvar' })}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {currentQuestion.body}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-app">
                    <button
                        onClick={handleToggleLike}
                        className={`flex items-center gap-2 transition-colors text-sm ${userLiked ? 'text-[#D70F24]' : 'text-muted hover:text-[#D70F24]'}`}
                    >
                        <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
                        <span>{t('community.answerPage.util', { defaultMessage: 'Útil' })} ({currentQuestion.like_count || 0})</span>
                    </button>
                    <button
                        onClick={handleScrollToReply}
                        className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('community.answerPage.responder', { defaultMessage: 'Responder' })}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>{t('community.answerPage.compartilhar', { defaultMessage: 'Compartilhar' })} ({currentQuestion.share_count || 0})</span>
                    </button>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{currentQuestion.view_count || 0}</span>
                    </div>
                </div>
            </div>

            {/* ===== ANSWERS SECTION ===== */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
                        {t('community.answerPage.respostas', { defaultMessage: 'Respostas' })}
                        <span className="bg-[#D70F24] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {answers.length}
                        </span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs">
                        <button
                            onClick={() => setActiveSort('recent')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSort === 'recent' ? 'bg-[#003768] text-white' : 'text-muted hover:text-primary'}`}
                        >
                            {t('community.answerPage.maisRecentes', { defaultMessage: 'Recentes' })}
                        </button>
                        <button
                            onClick={() => setActiveSort('voted')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSort === 'voted' ? 'bg-[#003768] text-white' : 'text-muted hover:text-primary'}`}
                        >
                            {t('community.answerPage.maisVotadas', { defaultMessage: 'Votadas' })}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loadingAnswers ? (
                        <div className="text-muted text-center py-4">Loading answers...</div>
                    ) : sortedAnswers.length > 0 ? (
                        sortedAnswers.map((answer) => (
                            <ReplyCard
                                key={answer.id}
                                answer={answer}
                                isLiked={userLikedAnswers.has(answer.id)}
                                onToggleLike={toggleAnswerLike}
                                onUpdate={updateAnswer}
                                onDelete={deleteAnswer}
                                onReply={(name: string) => setReplyText(prev => `@${name} ${prev}`)}
                                currentUser={user}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-secondary">
                            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted" />
                            <p className="font-medium">{t('community.answerPage.nenhumaResposta', { defaultMessage: 'Nenhuma resposta ainda.' })}</p>
                            <p className="text-sm">{t('community.answerPage.ajudePrimeiro', { defaultMessage: 'Seja o primeiro a ajudar!' })}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== YOUR REPLY SECTION ===== */}
            <section ref={replyFormRef} className="bg-surface border border-app rounded-2xl p-5 sm:p-6 shadow-sm scroll-mt-24">
                <h3 className="font-heading font-bold text-primary text-lg mb-4">{t('community.answerPage.suaResposta', { defaultMessage: 'Sua Resposta' })}</h3>

                <textarea
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('community.answerPage.replyPlaceholder', { defaultMessage: 'Escreva sua resposta para ajudar...' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] resize-none transition-all mb-4"
                    disabled={creatingAnswer}
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-muted text-xs">
                        Guidelines...
                    </p>
                    <button
                        onClick={handleReplySubmit}
                        disabled={creatingAnswer || !replyText.trim()}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#D70F24] hover:bg-[#b80d1f] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creatingAnswer ? 'Sending...' : t('community.answerPage.enviarResposta', { defaultMessage: 'Enviar Resposta' })}
                    </button>
                </div>
            </section>
        </div>
    );
}

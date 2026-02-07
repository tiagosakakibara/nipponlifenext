'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CommunityQuestion, QUESTION_CATEGORY_COLORS } from '@/types/community';
import { Heart, Eye } from 'lucide-react';

interface QuestionCardProps {
    question: CommunityQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
    const t = useTranslations();
    const authorName = (question.author as any)?.full_name || (question.author as any)?.username || t('community.questions.anonymous', { defaultMessage: 'Anônimo' });
    const avatarUrl = (question.author as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

    const getCategoryColor = (category: string | null) => {
        if (!category) return 'bg-gray-500';
        return QUESTION_CATEGORY_COLORS[category as keyof typeof QUESTION_CATEGORY_COLORS] || 'bg-gray-500';
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return t('community.time.now', { defaultMessage: 'Agora' });
        if (diffInHours < 24) return t('community.time.hours', { count: diffInHours });
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return t('community.time.days', { count: diffInDays });
        const diffInMonths = Math.floor(diffInDays / 30);
        return t('community.questions.time.months', { count: diffInMonths });
    };

    const CATEGORY_MAP: Record<string, string> = {
        'Visto e imigração': 'visto',
        'Saúde e seguros': 'saude',
        'Trabalho': 'trabalho',
        'Moradia': 'moradia',
        'Documentos e registros': 'documentos',
        'Convivência e cultura': 'cultura',
        'Outros': 'outros'
    };

    const categoryKey = question.category ? (CATEGORY_MAP[question.category] || question.category) : 'general';
    const categoryName = t(`community.categories.${categoryKey}`, { defaultMessage: question.category || 'Geral' });

    return (
        <Link
            href={`/comunidade/duvidas/${question.slug}`}
            className="block bg-surface border border-app rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Category + Time */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`${getCategoryColor(question.category)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                            {categoryName}
                        </span>
                        <span className="text-muted text-xs">• {getTimeAgo(question.created_at)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-semibold text-primary text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-[var(--nl-accent)] transition-colors">
                        {question.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-secondary text-xs sm:text-sm line-clamp-2 mb-3">
                        {question.body}
                    </p>

                    {/* Author + Stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-muted text-xs">{authorName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted text-xs">
                            <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {question.like_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {question.view_count || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Response Count */}
                <div className="flex flex-col items-center justify-center px-3 sm:px-4 border-l border-app">
                    <span className="text-[#D70F24] font-bold text-xl sm:text-2xl">{question.answers_count || 0}</span>
                    <span className="text-muted text-[10px] uppercase tracking-wide text-center leading-tight">
                        {t('community.questions.answersCount', { defaultMessage: 'Resp.' })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

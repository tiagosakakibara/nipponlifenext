'use client';

import { MessageSquare, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CommunityRecommendationsProps {
    locale: string;
}

interface Question {
    id: string;
    title: string;
    slug: string;
    author: {
        full_name?: string;
        username?: string;
    } | null;
    answer_count: number;
    category: string;
    created_at: string;
}

function QuestionCard({ title, slug, authorName, answersCount, category, createdAt }: any) {
    const t = useTranslations();

    const timeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours < 1) return 'há poucos minutos';
        if (diffInHours < 24) return `há ${diffInHours}h`;
        return `há ${Math.floor(diffInHours / 24)}d`;
    };

    return (
        <Link
            href={`/comunidade/duvidas/${slug}`}
            className="block bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-5 hover:shadow-md hover:border-blue-500/30 dark:hover:border-accent/30 transition-all duration-200"
        >
            {/* Category Badge + Time */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-50 dark:bg-accent/10">
                    {category || 'GERAL'}
                </span>
                <div className="flex items-center gap-1 text-muted text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(createdAt)}</span>
                </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-primary text-base mb-4 line-clamp-2 hover:text-blue-600 dark:hover:text-accent transition-colors min-h-[3rem]">
                {title}
            </h3>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                <span className="text-muted text-xs truncate max-w-[140px]">
                    por {authorName}
                </span>

                <div className="flex items-center gap-1.5 text-accent font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{answersCount}</span>
                </div>
            </div>
        </Link>
    );
}

export default function CommunityRecommendations({ locale }: CommunityRecommendationsProps) {
    const t = useTranslations();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('community_questions')
                    .select(`
                        id,
                        title,
                        slug,
                        category,
                        created_at,
                        answer_count,
                        author:profiles!community_questions_author_id_fkey(full_name, username)
                    `)
                    .in('status', ['active', 'open', 'answered'])
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (!error && data) {
                    console.log('Questions loaded:', data);
                    setQuestions(data as any);
                } else if (error) {
                    console.error('Error fetching questions:', error);
                }
            } catch (err) {
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    return (
        <section className="py-12 md:py-16 bg-app">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-primary text-2xl md:text-3xl font-bold">
                        {t('guides.questions.title')}
                    </h2>
                    <Link
                        href="/comunidade/duvidas"
                        className="text-accent text-sm font-bold hover:underline"
                    >
                        {t('guides.questions.viewAll')}
                    </Link>
                </div>

                {/* Questions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-5 h-48 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : questions.length > 0 ? (
                        questions.map((q) => (
                            <QuestionCard
                                key={q.id}
                                title={q.title}
                                slug={q.slug}
                                authorName={q.author?.full_name || q.author?.username || 'Anônimo'}
                                answersCount={q.answer_count || 0}
                                category={q.category || 'GERAL'}
                                createdAt={q.created_at}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center">
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                                Nenhuma dúvida recente encontrada.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

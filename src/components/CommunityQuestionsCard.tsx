'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { MessageCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Question {
    id: string;
    title: string;
    slug: string;
    created_at: string;
}

export function CommunityQuestionsCard() {
    const router = useRouter();
    const t = useTranslations();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        try {
            const { data } = await supabase
                .from('community_questions')
                .select('id, title, slug, created_at')
                .in('status', ['open', 'answered', 'active'])
                .not('author_id', 'is', null)

                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                setQuestions(data);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();

        const subscription = supabase
            .channel('public:community_questions_home')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'community_questions' },
                () => {
                    fetchQuestions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div
            className="carousel-item cursor-pointer w-[280px] md:w-[301px] group shrink-0"
            onClick={() => router.push('/comunidade/duvidas')}
        >
            <div className="relative h-[350px] w-full rounded-3xl overflow-hidden hover-lift shadow-lg hover:shadow-accent/20 transition-all duration-500 border border-white/10 bg-surface">
                {/* Background with slight gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#003768] to-[#002545]" />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                    <HelpCircle className="w-48 h-48 text-white" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 p-6 flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 uppercase tracking-widest">
                            <MessageCircle className="w-3 h-3" />
                            {t('community.questions.title')}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-3 leading-tight">
                            {t('community.questions.recentTitle')}
                        </h3>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-hidden space-y-3">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                            ))
                        ) : questions.length > 0 ? (
                            questions.map((q) => (
                                <div
                                    key={q.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/comunidade/duvidas/${q.slug}`);
                                    }}
                                    className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/item cursor-pointer"
                                >
                                    <p className="text-sm text-white/90 font-medium line-clamp-2 leading-snug group-hover/item:text-accent transition-colors">
                                        {q.title}
                                    </p>
                                    <span className="text-[10px] text-white/50 mt-1 block">
                                        {new Date(q.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-white/50 text-sm text-center py-4">
                                {t('community.questions.emptyTitle')}
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between text-white/80 hover:text-white transition-colors group-hover:translate-x-1 duration-300">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {t('common.viewAll')}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

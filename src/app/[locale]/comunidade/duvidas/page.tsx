import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { StatsCard } from './components/StatsCard';
import { PublishQuestionForm } from './components/PublishQuestionForm';
import { QuestionCard } from './components/QuestionCard';
import { Filter, LayoutGrid, HelpCircle } from 'lucide-react';
import { CommunityQuestion } from '@/types/community';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('community.questions.title', { defaultMessage: 'Perguntas e Respostas' })} | NipponLife`,
        description: t('community.questions.subtitle', { defaultMessage: 'Tire suas dúvidas e ajude a comunidade' }),
    };
}

export default async function CommunityQuestionsPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { q: searchQuery } = await searchParams; // Using q for search
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // 1. Fetch Questions
    let questionQuery = supabase
        .from('community_questions')
        .select(`
            *,
            author:profiles(username, full_name, avatar_url),
            answers:community_answers(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    // Note: 'answers:community_answers(count)' requires relationship setup. 
    // If not set up, we migth need to use rpc or fetch separately.
    // Assuming standard Supabase foreign key exists from answers -> questions.
    // If not, count might be tricky. The original code utilized `useCommunityQuestions` which did `.select('*, author:profiles(*), answers:community_answers(count)')`.
    // So likely it works.

    if (searchQuery) {
        questionQuery = questionQuery.ilike('title', `%${searchQuery}%`);
    }

    const { data: questionsData } = await questionQuery;

    const questions = (questionsData || []).map((q: any) => ({
        ...q,
        answers_count: q.answers ? (q.answers.length > 0 ? q.answers[0].count : (q.answers.count || 0)) : 0
        // Supabase count returns array `{ count: N }` usually if specified as head or aggregate?
        // Actually `answers(count)` returns `[{count: N}]` or similar.
    })) as CommunityQuestion[];

    // 2. Fetch Stats
    // We can do this via RPC or separate queries.
    // For simplicity, let's fetch counts using `head: true`.
    const { count: membersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: questionsCount } = await supabase.from('community_questions').select('*', { count: 'exact', head: true });
    const { count: answersCount } = await supabase.from('community_answers').select('*', { count: 'exact', head: true });

    return (
        <div className="min-h-screen bg-app font-sans transition-colors duration-300">
            {/* Header Search handled by Global Header usually, but page has local search too */}

            <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {/* ===== HERO SECTION ===== */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
                    {/* Left Column */}
                    <div>
                        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-4">
                            {t('community.questions.title', { defaultMessage: 'Perguntas e Respostas' }).split(' ').slice(0, -1).join(' ')}{' '}
                            <span className="text-[#D70F24]">{t('community.questions.title', { defaultMessage: 'Perguntas e Respostas' }).split(' ').pop()}</span>
                        </h1>
                        <p className="text-secondary text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
                            {t('community.questions.subtitle', { defaultMessage: 'Um espaço colaborativo para compartilhar conhecimento e experiências.' })}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {/* Scroll behavior handled client side usually, or just href to id */}
                            <a
                                href="#publish-form"
                                className="px-6 py-2.5 bg-[#D70F24] hover:bg-[#b80d1f] text-white font-semibold text-sm rounded-xl transition-colors inline-block"
                            >
                                {t('community.questions.postAction', { defaultMessage: 'Tirar uma Dúvida' })}
                            </a>
                            <button className="px-6 py-2.5 border border-app text-primary font-semibold text-sm rounded-xl hover:bg-surface transition-colors">
                                {t('community.questions.viewFaq', { defaultMessage: 'Ver FAQ' })}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Stats Card */}
                    <div className="hidden lg:block relative z-10">
                        <StatsCard
                            membersCount={membersCount || 0}
                            questionsCount={questionsCount || 0}
                            answersCount={answersCount || 0}
                        />
                    </div>
                </section>

                {/* ===== PUBLISH CARD ===== */}
                <section id="publish-form" className="mb-12 scroll-mt-24">
                    <PublishQuestionForm />
                </section>

                {/* ===== RECENT QUESTIONS ===== */}
                <section>
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-primary text-xl">{t('community.questions.recentTitle', { defaultMessage: 'Perguntas Recentes' })}</h2>
                        <div className="flex items-center gap-2">
                            {/* Filters placeholer for now */}
                            <button className="p-2 text-muted hover:text-primary transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-muted hover:text-primary transition-colors">
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                        {questions.length > 0 ? (
                            questions.map((question) => (
                                <QuestionCard key={question.id} question={question} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-secondary">
                                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted" />
                                <p className="text-lg font-medium mb-2">{t('community.questions.emptyTitle', { defaultMessage: 'Nenhuma pergunta encontrada' })}</p>
                                <p className="text-sm">{t('community.questions.emptySubtitle', { defaultMessage: 'Seja o primeiro a perguntar!' })}</p>
                            </div>
                        )}
                    </div>

                    {/* Load More - Link to page 2? For now simpler */}
                </section>
            </main>
        </div>
    );
}

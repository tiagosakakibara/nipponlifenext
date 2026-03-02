import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { ArticleTracking } from '@/components/ArticleTracking';
import { QuestionDetailClient } from './components/QuestionDetailClient';
import { CommunityQuestion, CommunityAnswer } from '@/types/community';
import { generateSEOMetadata } from '@/lib/metadata';

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const supabase = await createClient();
    const { data: question } = await supabase
        .from('community_questions')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!question) return {};

    return generateSEOMetadata({
        title: question.title,
        description: (question.content || question.body || '').substring(0, 160),
        locale,
        type: 'article',
        url: `/comunidade/duvidas/${slug}`,
        images: [],
        publishedTime: question.created_at,
    });
}

export default async function QuestionDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch Question
    const { data: questionData, error: qError } = await supabase
        .from('community_questions')
        .select(`
            *,
            author:profiles(username, full_name, avatar_url)
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (qError || !questionData) {
        notFound();
    }

    const question = {
        ...questionData,
        body: questionData.content || questionData.body,
        author: Array.isArray(questionData.author) ? questionData.author[0] : questionData.author
    } as CommunityQuestion;

    // 2. Fetch Answers
    const { data: answersData } = await supabase
        .from('community_answers')
        .select(`
            *,
            author:profiles(username, full_name, avatar_url)
        `)
        .eq('question_id', question.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

    const answers = (answersData || []).map((a: any) => ({
        ...a,
        body: a.content || a.body,
        author: Array.isArray(a.author) ? a.author[0] : a.author
    })) as CommunityAnswer[];

    return (
        <div className="min-h-screen bg-app font-sans">
            {/* Tracking can be handled here or inside Component. 
                 If ArticleTracking supports 'question', good. 
                 It uses 'community' type in 'ArticleTracking.tsx' but calls 'increment_post_view'.
                 We might need 'increment_question_view'.
                 I will assume ArticleTracking needs update or I use custom tracking here.
                 Since I can't easily update ArticleTracking without checking it first (and it failed previously),
                 I will rely on the hook's original tracking which was 'useTrackView' but I removed it.
                 So I should simply use a Script that calls RPC? 
                 Or better: I will add ArticleTracking logic for questions if possible.
                 For now, I will omit ArticleTracking if it's strictly for 'community_posts'.
                 But the hook 'useCommunityQuestionDetail.ts' (old) used 'useTrackView' ('question', slug).
                 I should probably not break view counting.
                 I'll add a database call here to increment view on server side? 
                 Next.js Server Components are cached, so incrementing view on render is tricky (deduplication).
                 Best to do it in Client Component via useEffect.
                 I'll leave it to QuestionDetailClient to trigger a simplified RPC call within useEffect.
            */}
            <QuestionDetailClient
                initialQuestion={question}
                initialAnswers={answers}
            />
        </div>
    );
}

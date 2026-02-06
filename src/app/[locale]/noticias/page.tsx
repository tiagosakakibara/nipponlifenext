import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { NewsList } from './NewsList';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale });
    return {
        title: `${t('news.title')} | NipponLife`,
        description: t('news.subtitle'),
    };
}

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NoticiasPage({ params, searchParams }: Props) {
    const supabase = await createClient();
    const { tag } = await searchParams;

    // 1. Fetch News Posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            categories (id, name, slug)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    // 2. Fetch Categories for the filter bar
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    return (
        <main className="min-h-screen bg-app">
            <NewsList
                initialPosts={posts || []}
                categories={categories || []}
                initialTag={typeof tag === 'string' ? tag : undefined}
            />
        </main>
    );
}

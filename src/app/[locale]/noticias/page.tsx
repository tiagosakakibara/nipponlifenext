import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { NewsList } from './NewsList';

export const revalidate = 300; // ISR: Revalida a cada 5 minutos

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

    // 1. Fetch News Posts — seleciona apenas campos necessários para listagem
    // (exclui content/content_md que são corpos completos e pesados)
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id, slug, title, title_en, title_ja,
            excerpt, excerpt_en, excerpt_ja,
            cover_image_url, created_at, published_at,
            view_count, tags,
            categories (id, name, slug)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(200);

    // 2. Fetch Categories for the filter bar
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, sort_order')
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

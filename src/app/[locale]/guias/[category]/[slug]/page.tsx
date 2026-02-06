import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Clock, ChevronRight, Home, Calendar, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateSEOMetadata } from '@/lib/metadata';

type Props = {
    params: Promise<{ locale: string; category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, slug, category } = await params;
    const supabase = await createClient();

    const { data: guide } = await supabase
        .from('guides')
        .select('*, guides_categories(*)')
        .eq('slug', slug)
        .single();

    if (!guide) {
        return {
            title: 'Guide Not Found | NipponLife',
        };
    }

    const title = locale === 'ja' ? guide.title_ja || guide.title : locale === 'en' ? guide.title_en || guide.title : guide.title;
    const excerpt = locale === 'ja' ? guide.excerpt_ja || guide.excerpt : locale === 'en' ? guide.excerpt_en || guide.excerpt : guide.excerpt;
    const categorySlug = guide.guides_categories?.slug || category;

    return generateSEOMetadata({
        title,
        description: excerpt || '',
        locale,
        type: 'article',
        url: `/guias/${categorySlug}/${slug}`,
        images: guide.cover_image_url ? [guide.cover_image_url] : [],
        publishedTime: guide.published_at || guide.created_at,
        modifiedTime: guide.updated_at,
    });
}

export default async function GuidePage({ params }: Props) {
    const { locale, category, slug } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // Fetch guide with category
    const { data: guide, error } = await supabase
        .from('guides')
        .select(`
            *,
            guides_categories(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (error || !guide) {
        return notFound();
    }

    // Increment view count
    await supabase
        .from('guides')
        .update({ view_count: (guide.view_count || 0) + 1 })
        .eq('id', guide.id);

    const title = locale === 'ja' ? guide.title_ja || guide.title : locale === 'en' ? guide.title_en || guide.title : guide.title;
    const content = locale === 'ja' ? guide.content_ja || guide.content : locale === 'en' ? guide.content_en || guide.content : guide.content;
    const categoryName = locale === 'ja' ? guide.guides_categories.name_ja : locale === 'en' ? guide.guides_categories.name_en : guide.guides_categories.name;

    return (
        <main className="min-h-screen bg-app py-12 px-4">
            <article className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted mb-8 flex-wrap">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        <span>{t('nav.home')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/guias/recem-chegado" className="hover:text-primary transition-colors">
                        {t('guides.newcomerGuide')}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href={`/guias/${category}`} className="hover:text-primary transition-colors">
                        {categoryName}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-primary font-medium line-clamp-1">{title}</span>
                </nav>

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-4 leading-tight">
                        {title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                        {guide.published_at && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={guide.published_at}>
                                    {new Date(guide.published_at).toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>
                        )}
                        {guide.reading_time_minutes && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{guide.reading_time_minutes} {t('guides.minutesRead')}</span>
                            </div>
                        )}
                        {guide.view_count > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                <span>{guide.view_count} {t('guides.views')}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Cover Image */}
                {guide.cover_image_url && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={guide.cover_image_url}
                            alt={title}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="bg-surface border border-app rounded-2xl p-6 md:p-10 shadow-sm">
                    <div className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:text-primary prose-headings:font-black
                        prose-p:text-muted prose-p:leading-relaxed
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-primary prose-strong:font-bold
                        prose-ul:text-muted prose-ol:text-muted
                        prose-li:marker:text-accent
                        prose-blockquote:border-l-accent prose-blockquote:bg-accent/5 prose-blockquote:py-1
                        prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-gray-900 prose-pre:text-gray-100
                        prose-img:rounded-xl prose-img:shadow-md
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content || ''}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Related Guides CTA */}
                <div className="mt-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-center text-white shadow-lg">
                    <h2 className="text-2xl font-black mb-3">
                        {t('guides.moreGuides')}
                    </h2>
                    <p className="text-white/90 mb-6">
                        {t('guides.exploreMore')}
                    </p>
                    <Link
                        href={`/guias/${category}`}
                        className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                        {t('guides.viewCategory')}
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </main>
    );
}

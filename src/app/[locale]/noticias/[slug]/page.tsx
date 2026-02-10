import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { getTranslatedField, getCategoryTranslationKey } from '@/lib/getTranslatedField';
import { calculateReadingTime } from '@/utils/readingTime';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Calendar, Clock, Eye, TrendingUp, ChevronLeft, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { ShareActions } from '@/components/ShareActions';
import { CommentSection } from '@/components/CommentSection';
import { ArticleTracking } from '@/components/ArticleTracking';
import { generateSEOMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';

// ISR: Revalidate every 10 minutes — artigos raramente mudam após publicação
export const revalidate = 600;

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt, content, cover_image_url, created_at, updated_at, title_ja, title_en, excerpt_ja, excerpt_en')
        .eq('slug', slug)
        .single();

    if (!post) {
        return {
            title: 'Not Found',
        };
    }

    const title = getTranslatedField(post, 'title', locale);
    const excerpt = getTranslatedField(post, 'excerpt', locale);
    const content = getTranslatedField(post, 'content', locale);

    return generateSEOMetadata({
        title,
        description: excerpt || content.substring(0, 160).replace(/<[^>]*>/g, ''),
        locale,
        type: 'article',
        url: `/noticias/${slug}`,
        images: post.cover_image_url ? [post.cover_image_url] : [],
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
    });
}

export default async function NewsArticlePage({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // 1. Fetch main post
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            categories (name, slug)
        `)
        .eq('slug', slug)
        .single();

    if (error || !post) {
        notFound();
    }

    // 2. Fetch trending posts
    const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`*, categories(name, slug)`)
        .eq('status', 'published')
        .neq('slug', slug)
        .order('view_count', { ascending: false })
        .limit(5);

    const title = getTranslatedField(post, 'title', locale);
    const excerpt = getTranslatedField(post, 'excerpt', locale);
    const rawContent = getTranslatedField(post, 'content', locale);
    const contentMd = getTranslatedField(post, 'content_md', locale);

    // Clean AI content reference markers from HTML
    const cleanContentReferences = (html: string): string => {
        if (!html) return '';
        let cleaned = html.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
        cleaned = cleaned.replace(/<strong>\s*:contentReference\[oaicite:\d+\]\{index=\d+\}\s*<\/strong>/g, '');
        cleaned = cleaned.replace(/contentReference\[.*?\]\{.*?\}/g, '');
        return cleaned;
    };

    const content = cleanContentReferences(rawContent);

    // Generate JSON-LD schemas
    const articleSchema = generateArticleSchema({
        title,
        description: excerpt || content.substring(0, 160).replace(/<[^>]*>/g, ''),
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/noticias/${slug}`,
        image: post.cover_image_url,
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at,
        authorName: 'NipponLife',
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: t('breadcrumb.home', { defaultValue: 'Home' }), url: `/${locale}` },
        { name: t('news.title', { defaultValue: 'Notícias' }), url: `/${locale}/noticias` },
        { name: title, url: `/${locale}/noticias/${slug}` },
    ]);

    return (
        <>
            <StructuredData data={articleSchema} />
            <StructuredData data={breadcrumbSchema} />

            <ArticleTracking slug={slug} type="news" />

            {/* Article Hero */}
            <div className="relative w-full h-[280px] md:h-72 lg:h-80 overflow-hidden">
                <ResponsiveImage
                    src={post.cover_image_url}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
                    {/* Back Button */}
                    <div className="max-w-4xl mx-auto px-6 pt-6 md:pt-10 w-full relative z-30">
                        <div className="relative inline-flex">
                            <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse blur-md"></span>
                            <Link
                                href="/noticias"
                                className="relative flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full transition-all group shadow-sm hover:shadow-md"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('news.title')}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Content (Title, Tag, Stats) */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="max-w-4xl mx-auto px-6 pb-8 md:pb-10 w-full z-20">
                            <h1 className="text-xl md:text-2xl lg:text-4xl font-display font-black leading-tight mb-4 text-white tracking-tight">
                                {title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-5 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-[var(--nl-accent)]" />
                                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[var(--nl-accent)]" />
                                    <span>{calculateReadingTime(content).replace('min de leitura', t('news.readingTime', { defaultMessage: 'min de leitura' }))}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-3.5 h-3.5 text-[var(--nl-accent)]" />
                                    <span>{post.view_count || 0} {t('common.views')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[auto_minmax(0,1fr)_20rem] gap-8 lg:gap-10 xl:gap-16 items-start">
                    {/* Left Sidebar - Social Share */}
                    <div className="hidden xl:flex sticky top-32 h-fit">
                        <ShareActions
                            title={title}
                            text={t('news.shareText', { defaultMessage: 'Confira esta notícia no NipponLife' })}
                            variant="sidebar"
                        />
                    </div>

                    {/* Main Content */}
                    <article className="max-w-3xl min-w-0 w-full overflow-x-hidden">
                        {/* Article Text */}
                        {contentMd ? (
                            <div className="prose dark:prose-invert prose-lg max-w-none overflow-x-hidden
                                         prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary
                                         prose-p:text-secondary prose-p:leading-[1.8] prose-p:mb-8
                                         prose-strong:text-primary prose-strong:font-bold
                                         prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:w-full prose-img:max-w-full prose-img:h-auto
                                         prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-a:break-words
                                         prose-li:text-secondary
                                         [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block
                                         [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMd}</ReactMarkdown>
                            </div>
                        ) : (
                            <div
                                className="prose dark:prose-invert prose-lg max-w-none overflow-x-hidden
                                         prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary
                                         prose-p:text-secondary prose-p:leading-[1.8] prose-p:mb-8
                                         prose-strong:text-primary prose-strong:font-bold
                                         prose-blockquote:border-l-4 prose-blockquote:border-[var(--nl-accent)] prose-blockquote:bg-surface prose-blockquote:px-8 prose-blockquote:py-1 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:my-12
                                         prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:w-full prose-img:max-w-full prose-img:h-auto
                                         prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-a:break-words
                                         prose-ul:my-6 prose-ul:space-y-3
                                         prose-ol:my-6 prose-ol:space-y-3
                                         prose-li:text-secondary prose-li:leading-relaxed
                                         [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block
                                         [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words
                                         article-content"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        )}

                        {/* Mobile Share Actions - Visible only on mobile/tablet */}
                        <div className="mt-12 xl:hidden">
                            <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">{t('news.share')}</h3>
                            <ShareActions
                                title={title}
                                text={t('news.shareText', { defaultMessage: 'Confira esta notícia no NipponLife' })}
                                variant="inline"
                            />
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-app">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-accent" />
                                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{t('news.tags', { defaultMessage: 'Assuntos Relacionados' })}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.flatMap((t: string) => t.split(',')).map((tag: string, idx: number) => {
                                        const trimmedTag = tag.trim();
                                        if (!trimmedTag) return null;
                                        return (
                                            <Link
                                                key={`${trimmedTag}-${idx}`}
                                                href={`/noticias?tag=${encodeURIComponent(trimmedTag.toLowerCase())}`} // This might need logic in NewsList to handle queries params, likely passed as props if SSR or useSearchParams in Client Component
                                                className="px-4 py-2 rounded-xl bg-surface border border-app text-secondary text-[10px] font-bold uppercase tracking-wider hover:text-white hover:bg-accent hover:border-accent cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-accent/20"
                                            >
                                                {trimmedTag}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        {post.allow_comments !== false && (
                            <CommentSection
                                postId={post.id}
                                tableName="post_comments"
                                likesTableName="post_comment_likes"
                            />
                        )}
                    </article>

                    {/* Right Sidebar */}
                    <aside className="w-full space-y-12 lg:sticky lg:top-8">
                        {/* Trending Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                <h3 className="text-xl font-bold font-display text-primary">{t('news.trending')}</h3>
                            </div>
                            <div className="space-y-6">
                                {trendingPosts?.map((tp: any) => (
                                    <Link
                                        key={tp.id}
                                        href={`/noticias/${tp.slug}`}
                                        className="flex gap-4 group cursor-pointer"
                                    >
                                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                                            <ResponsiveImage src={tp.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">
                                                {(() => { const cat = getCategoryTranslationKey(tp.categories); return t(`categories.${cat.key}`, { defaultMessage: cat.fallback }); })()}
                                            </span>
                                            <h4 className="text-sm font-bold line-clamp-2 leading-snug text-primary group-hover:text-accent transition-colors">
                                                {getTranslatedField(tp, 'title', locale)}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Sidebar */}
                        <div className="p-8 rounded-3xl bg-surface border border-app shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-[var(--nl-accent)]/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <Mail className="w-8 h-8 text-accent mb-6" />
                            <h3 className="text-xl font-bold mb-4 font-display text-primary">{t('news.newsletterTitle')}</h3>
                            <p className="text-secondary text-sm mb-6 leading-relaxed">
                                {t('news.newsletterDesc')}
                            </p>
                            <form className="space-y-3">
                                <input
                                    type="email"
                                    placeholder={t('news.newsletterPlaceholder')}
                                    className="w-full bg-app/50 border border-app rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nl-accent)]/50 text-primary placeholder:text-muted"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-accent hover:bg-[#b50d1f] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-accent/20 active:scale-[0.98]"
                                >
                                    {t('news.newsletterButton')}
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}

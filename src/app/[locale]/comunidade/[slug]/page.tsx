import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { Link } from '@/i18n/routing';
import { storageService } from '@/lib/storageService';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { ArticleTracking } from '@/components/ArticleTracking';
import { ShareActions } from '@/components/ShareActions';
import { CommentSection } from '../components/CommentSection';
import { PostInteractions } from '../components/PostInteractions';
import { FloatingPostActions } from '../components/FloatingPostActions';
import { ArrowLeft, Calendar, User, Eye, TrendingUp, ThumbsUp, Share2 } from 'lucide-react';
import { generateSEOMetadata } from '@/lib/metadata';

// ISR: Revalidate every 2 minutes for community posts
export const revalidate = 120;

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase.from('community_posts').select('*').eq('slug', slug).single();

    if (!post) return {};

    const title = getTranslatedField(post, 'title', locale);
    const desc = getTranslatedField(post, 'excerpt', locale) || '';

    return generateSEOMetadata({
        title,
        description: desc,
        locale,
        type: 'article',
        url: `/comunidade/${slug}`,
        images: post.cover_image_url ? [post.cover_image_url] : [],
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at,
    });
}

export default async function CommunityPostDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    const { data: post } = await supabase
        .from('community_posts')
        .select(`
            *,
            author:profiles(username, full_name, avatar_url),
            community_categories(name, slug),
            tags:community_post_tags(tag)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (!post) {
        notFound();
    }

    // Fetch popular posts for sidebar
    const { data: popularPosts } = await supabase
        .from('community_posts')
        .select('id, slug, title, view_count, cover_image_url, community_categories(name)')
        .eq('status', 'published')
        .neq('id', post.id) // Won't crash now
        .order('view_count', { ascending: false })
        .limit(3);

    const title = getTranslatedField(post, 'title', locale);
    const content = getTranslatedField(post, 'content', locale);
    const categoryName = (post.community_categories as any)?.name || 'Geral';
    const categorySlug = (post.community_categories as any)?.slug || 'geral';

    const categoryLabel = t(`community.categories.${categorySlug}`, { defaultMessage: categoryName });
    const authorName = (post.author as any)?.full_name || (post.author as any)?.username || t('community.questions.anonymous', { defaultMessage: 'Anônimo' });
    const authorAvatar = (post.author as any)?.avatar_url;

    // Format date manually or use library. Server Component -> toLocaleString
    const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const excerpt = getTranslatedField(post, 'excerpt', locale);
    const hasExcerpt = !!excerpt;
    const pageUrl = `https://nippon-life.com/${locale}/comunidade/${slug}`;

    return (
        <div className="min-h-screen bg-app pb-20">
            <ArticleTracking id={post.id} type="community" />

            {/* Hero Section */}
            <div className="relative h-[230px] lg:h-[256px] w-full overflow-hidden bg-black">
                {/* Background Image */}
                {post.cover_image_url && (
                    <div className="absolute inset-0">
                        <img
                            src={storageService.getFileUrl(post.cover_image_url)}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                )}

                {/* Hero Content - Centered */}
                <div className="relative h-full max-w-[1000px] mx-auto px-4 flex flex-col justify-center items-center text-center pt-10">
                    {/* Breadcrumb / Back Link */}
                    <Link
                        href="/comunidade"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-all mb-4 uppercase text-[10px] font-black tracking-[0.2em]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {t('community.post.backLink', { defaultMessage: 'Voltar para Comunidade' })}
                    </Link>

                    {/* Category Tag */}
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-[#D70F24] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl">
                            {categoryLabel}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl md:text-3xl lg:text-[36px] font-display font-bold text-white leading-tight mb-4 max-w-4xl">
                        {title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-white/90 font-bold uppercase tracking-[0.1em]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#D70F24]" />
                            <span>{publishDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-[#D70F24]" />
                            <span>{post.view_count || 0} {t('community.post.views', { defaultMessage: 'visualizações' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#D70F24]" />
                            <span>{authorName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12 relative">
                    {/* Floating Side Actions (Desktop) */}
                    <FloatingPostActions postId={post.id} pageUrl={pageUrl} title={title} />

                    {/* Main Content */}
                    <article className="flex-1 min-w-0">
                        {/* Info Alert Box */}
                        {hasExcerpt && (
                            <div className="bg-red-50/60 dark:bg-red-950/20 border-l-[3px] border-[#D70F24] p-4 md:p-6 mb-8 rounded-tr-3xl rounded-br-3xl shadow-sm">
                                <p className="italic text-primary/80 text-xs md:text-sm leading-relaxed">
                                    {excerpt}
                                </p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="content-rendered prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-[var(--nl-link)] prose-img:rounded-2xl text-primary leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>

                        {/* Interaction Buttons (Like, Views, Share) */}
                        <PostInteractions
                            postId={post.id}
                            initialLikeCount={post.like_count || 0}
                            initialViewCount={post.view_count || 0}
                            initialShareCount={post.share_count || 0}
                            pageUrl={pageUrl}
                            title={title}
                        />


                        {/* Comments Section */}
                        <CommentSection postId={post.id} />
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-[320px] flex-shrink-0">
                        {/* Populares Widget */}
                        <div className="mb-10">
                            <h3 className="text-sm font-black text-primary mb-6 uppercase tracking-[0.15em] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#D70F24]" />
                                Populares
                            </h3>
                            <div className="space-y-6">
                                {popularPosts?.map((pop) => (
                                    <Link
                                        key={pop.id}
                                        href={`/comunidade/${pop.slug}`}
                                        className="flex gap-4 group cursor-pointer"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-app">
                                            {pop.cover_image_url ? (
                                                <img
                                                    src={storageService.getFileUrl(pop.cover_image_url)}
                                                    alt={getTranslatedField(pop, 'title', locale)}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-black text-[#D70F24] uppercase tracking-widest block mb-1">
                                                {(pop.community_categories as any)?.name || 'Geral'}
                                            </span>
                                            <h4 className="text-xs font-bold text-primary group-hover:text-[#D70F24] transition-colors line-clamp-2 leading-snug">
                                                {getTranslatedField(pop, 'title', locale)}
                                            </h4>
                                            <span className="text-[10px] text-zinc-400 mt-1 block">
                                                {pop.view_count || 0} {t('community.post.views', { defaultMessage: 'visualizações' })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Participation Card - Adjusted to match original (light background, red button) */}
                        <div className="p-8 bg-surface border border-app rounded-3xl text-center relative overflow-hidden transition-all hover:shadow-xl">
                            <h3 className="text-xl font-black text-primary mb-4 relative z-10">Participe da Comunidade</h3>
                            <p className="text-secondary text-sm mb-8 relative z-10 leading-relaxed">
                                Junte-se a milhares de brasileiros no Japão para trocar experiências e dicas valiosas.
                            </p>
                            <Link
                                href="/comunidade"
                                className="inline-block w-full py-3.5 bg-[#D70F24] text-white rounded-xl text-center font-black text-xs uppercase tracking-widest hover:bg-[#b00d1d] transition-colors relative z-10 shadow-lg shadow-red-500/20"
                            >
                                Ver Todas as Comunidades
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

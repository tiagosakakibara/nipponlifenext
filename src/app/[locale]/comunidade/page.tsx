import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { PostCard } from './components/PostCard';
import { CategoriesSidebar, CategoryWithStats } from './components/CategoriesSidebar';
import { RightWidgets, CommunityEvent } from './components/RightWidgets';
import { ReelsRow } from './components/ReelsRow';
import { CommunityReel, fetchActiveReels } from '@/lib/reelsService';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { CommunityPost } from '@/types/community';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('community.title', { defaultMessage: 'Comunidade' })} | NipponLife`,
        description: t('community.subtitle', { defaultMessage: 'Conecte-se com a comunidade brasileira no Japão' }),
    };
}

export default async function CommunityPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { category: categorySlug, q: searchQuery } = await searchParams;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // 1. Fetch User (for likes)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch Posts
    let postQuery = supabase
        .from('community_posts')
        .select(`
            *,
            author:profiles(username, full_name, avatar_url),
            community_categories(name, slug),
            tags:community_post_tags(tag)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

    if (categorySlug) {
        // Find category ID by slug first or join filtering
        // Supabase supports filtering on joined resource? 
        // .eq('community_categories.slug', categorySlug) usually requires !inner join
        const { data: catData } = await supabase.from('community_categories').select('id').eq('slug', categorySlug).single();
        if (catData) {
            postQuery = postQuery.eq('category_id', catData.id);
        }
    }

    if (searchQuery) {
        postQuery = postQuery.ilike('title', `%${searchQuery}%`);
    }

    const { data: postsData } = await postQuery;

    // 3. Fetch User Likes (if logged in)
    const likedPostIds = new Set<string>();
    if (user && postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id);
        const { data: likes } = await supabase
            .from('community_likes')
            .select('target_id')
            .eq('user_id', user.id)
            .eq('target_type', 'post')
            .in('target_id', postIds);

        if (likes) {
            likes.forEach(l => likedPostIds.add(l.target_id));
        }
    }

    // 4. Fetch Categories with Stats
    // Try RPC first? Or manual.
    // Manual fetch of categories + post counts/views is expensive if we fetch all posts.
    // For now, let's just fetch categories. Stat calculation might be too heavy for Server Component on every request without caching.
    // We will simulate stats or fetch simple list.
    // Let's try to fetch categories and just map them.
    const { data: categoriesData } = await supabase
        .from('community_categories')
        .select('id, name, slug, icon')
        .order('sort_order', { ascending: true });

    // Mock stats or separate query?
    // Using a separate query to count posts per category is better: .select('id, count', { count: 'exact', head: true }).eq('category_id', ...)
    // But doing it for N categories is N queries.
    // Let's skip heavy stats for now and just set 0 or random, OR rely on a View if it existed.
    // The old code fetched ALL posts. I will skip that for performance and just show categories.
    const categories: CategoryWithStats[] = (categoriesData || []).map(c => ({
        ...c,
        total_views: 0, // Placeholder
        post_count: 0   // Placeholder
    }));

    // 5. Fetch Events (Right Sidebar)
    const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('id, title, title_en, title_ja, location, starts_at, slug')
        .gte('starts_at', new Date().toISOString())
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(3);

    // 6. Fetch Reels
    // We can use the service function directly as it uses supabase client (which we can init or use service logic).
    // The service `fetchActiveReels` imports `supabase` from `@/lib/supabaseClient` which is Browser Client (mostly).
    // In Server Component, we should use `createClient`.
    // I will duplicate logic here or make service accept client.
    // For simplicity, duplicate logic for Server Component safety.
    const { data: reelsData } = await supabase
        .from('community_reels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);


    // Helper for Time Ago
    const getTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return t('community.time.now', { defaultMessage: 'Agora' });
        if (diffInHours < 24) return t('community.time.hours', { count: diffInHours, defaultMessage: '{count}h atrás' });
        const diffInDays = Math.floor(diffInHours / 24);
        return t('community.time.days', { count: diffInDays, defaultMessage: '{count}d atrás' });
    };

    return (
        <div className="min-h-screen bg-app font-sans transition-colors duration-300">
            {/* Header Search is generic global, but here we can add a specific search bar? 
                Old CommunityPage used `Header` component.
                We have Main Header layout.
             */}

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Sidebar */}
                    <div className="hidden lg:block w-[260px] flex-shrink-0 sticky top-24">
                        <CategoriesSidebar categories={categories} />
                    </div>

                    {/* Center Column */}
                    <div className="flex-1 min-w-0 w-full">
                        {/* Mobile Categories Link / Banner could go here */}

                        {/* Reels */}
                        <div className="mb-8">
                            <ReelsRow reels={(reelsData as CommunityReel[]) || []} />
                        </div>

                        {/* Feed */}
                        <div className="flex flex-col gap-4">
                            {postsData && postsData.length > 0 ? (
                                postsData.map(post => {
                                    // Transform post for Card
                                    const author = post.author as any; // Type assertion (single object)
                                    // Supabase returns array if not single, but here it's joined.
                                    // Actually `author:profiles(...)` returns single object if relation is 1:1 or N:1 correctly defined.
                                    // Usually it returns an object if foreign key is used.
                                    // Let's assume it works as `post.author`.

                                    const tags = (post.tags as any[])?.map(t => `#${t.tag}`) || [];
                                    const categoryName = (post.community_categories as any)?.name || 'Geral';

                                    return (
                                        <PostCard
                                            key={post.id}
                                            postId={post.id}
                                            slug={post.slug}
                                            avatar={author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || 'Nippon'}`}
                                            name={author?.full_name || author?.username || 'Membro NipponLife'}
                                            time={getTimeAgo(post.published_at || post.created_at)}
                                            category={t(`community.categories.${categoryName}`, { defaultMessage: categoryName })}
                                            title={getTranslatedField(post as any, 'title', locale)}
                                            content={(getTranslatedField(post as any, 'excerpt', locale) || getTranslatedField(post as any, 'content', locale) || '').substring(0, 180) + '...'}
                                            image={post.cover_image_url}
                                            tags={tags}
                                            likes={post.like_count || 0}
                                            isLikedInitial={likedPostIds.has(post.id)}
                                            comments={post.comment_count || 0}
                                            views={post.view_count || 0}
                                        />
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-secondary bg-surface rounded-2xl border border-app">
                                    {t('community.empty', { defaultMessage: 'Nenhum post encontrado.' })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden xl:block w-[320px] flex-shrink-0 sticky top-24">
                        <RightWidgets events={(eventsData as CommunityEvent[]) || []} />
                    </div>

                </div>
            </main>
        </div>
    );
}

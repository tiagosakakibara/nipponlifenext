'use client';

import { useState, useMemo } from 'react';
import { Search, Clock, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { LargeFeaturedCard, FeaturedItem } from '@/components/LargeFeaturedCard';
import { SmallFeaturedCard } from '@/components/SmallFeaturedCard';
import { normalizeCategorySlug } from '@/lib/getTranslatedField';

interface NewsListProps {
    initialPosts: any[];
    categories: any[];
    initialTag?: string;
}

export function NewsList({ initialPosts, categories, initialTag }: NewsListProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    // Filter Logic
    const filteredPosts = useMemo(() => {
        return initialPosts.filter(post => {
            const postCategory = Array.isArray(post.categories) ? post.categories[0] : post.categories;
            const matchesCategory = activeCategory === 'todos' || postCategory?.slug === activeCategory;

            const matchesSearch =
                post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.excerpt?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (post.title_ja?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (post.title_en?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            const matchesTag = !initialTag || (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(initialTag.toLowerCase())));

            return matchesCategory && matchesSearch && matchesTag;
        });
    }, [initialPosts, activeCategory, searchQuery, initialTag]);

    const featuredPost = filteredPosts.find(p => p.is_featured) || filteredPosts[0];
    const gridPosts = filteredPosts.filter(p => !featuredPost || p.id !== featuredPost.id);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = gridPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(gridPosts.length / postsPerPage);

    const mapToFeaturedItem = (post: any): FeaturedItem => ({
        id: post.id,
        type: 'news',
        title: post.title,
        summary: post.excerpt || '',
        date: post.published_at || post.created_at,
        image: post.cover_image_url,
        category: post.categories?.name || 'Geral',
        slug: post.slug,
        title_ja: post.title_ja,
        title_en: post.title_en,
        summary_ja: post.excerpt_ja,
        summary_en: post.excerpt_en
    });

    return (
        <div className="max-w-container mx-auto px-6 py-12">
            {/* Hero Title */}
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight text-primary uppercase italic">
                    {t('news.title').split(' ')[0]} <span className="text-accent">{t('news.title').split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-secondary max-w-2xl text-lg font-medium opacity-80">
                    {t('news.subtitle')}
                </p>
            </div>

            {/* Featured Post */}
            {featuredPost && currentPage === 1 && !searchQuery && (
                <div className="mb-12">
                    <LargeFeaturedCard item={mapToFeaturedItem(featuredPost)} />
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="hidden md:block mb-12 sticky top-24 z-30 py-4 bg-surface/90 backdrop-blur-xl rounded-[2.5rem] px-6 border border-app shadow-lg">
                <div className="flex flex-col gap-6">
                    {/* Categories Row */}
                    <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 scrollbar-hide">
                        <button
                            onClick={() => { setActiveCategory('todos'); setCurrentPage(1); }}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 flex-shrink-0 border ${activeCategory === 'todos' ? 'bg-accent border-accent text-white shadow-lg shadow-red-500/20' : 'bg-app border-app text-secondary hover:border-accent/30'}`}
                        >
                            {t('common.all')}
                        </button>
                        {categories
                            .filter(cat => {
                                const slug = (cat.slug || '').toLowerCase();
                                return !slug.includes('noticia') && !slug.includes('news');
                            })
                            .map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setActiveCategory(cat.slug); setCurrentPage(1); }}
                                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 flex-shrink-0 border ${activeCategory === cat.slug ? 'bg-accent border-accent text-white shadow-lg shadow-red-500/20' : 'bg-app border-app text-secondary hover:border-accent/30'}`}
                                >
                                    {t(`categories.${normalizeCategorySlug(cat.slug)}`, { defaultMessage: cat.name })}
                                </button>
                            ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder={t('common.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-app border border-app rounded-full py-3.5 pl-14 pr-6 text-sm text-primary font-medium focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent placeholder:text-muted transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <SmallFeaturedCard key={post.id} item={mapToFeaturedItem(post)} />
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center">
                        <Newspaper className="w-16 h-16 text-muted mx-auto mb-4 opacity-20" />
                        <p className="text-secondary font-display text-xl font-bold opacity-50">
                            {t('common.noResults')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-16">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-3 rounded-2xl bg-surface border border-app hover:border-accent/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-primary shadow-sm"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-12 h-12 rounded-2xl font-black text-sm transition-all border ${currentPage === i + 1 ? 'bg-accent border-accent text-white shadow-lg' : 'bg-surface border-app text-secondary hover:border-accent/30'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-3 rounded-2xl bg-surface border border-app hover:border-accent/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-primary shadow-sm"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

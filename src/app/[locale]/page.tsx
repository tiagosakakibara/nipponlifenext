import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { Link } from '@/i18n/routing';
import { Carousel } from '@/components/Carousel';
import { SectionHeader } from '@/components/SectionHeader';
import { BusinessCard } from '@/components/BusinessCard';
import { HeroSection } from '@/components/HeroSection';
import { Building2, Users, Camera, ArrowRight, Briefcase } from 'lucide-react';
import { Business } from '@/types/business';

import { CommunityCard, CommunityItem } from '@/components/CommunityCard';
import { CommunityQuestionsCard } from '@/components/CommunityQuestionsCard';
import { StatisticsCard } from '@/components/StatisticsCard';
import { featuredStatisticsCard } from '@/lib/mocks';
import { FeaturedHighlights } from '@/components/FeaturedHighlights';
import { FeaturedItem } from '@/components/LargeFeaturedCard';
import { GalleryAlbumCard } from '@/components/GalleryAlbumCard';
import { ReelsRow } from '@/components/ReelsRow';

import { GalleryAlbumWithStats } from '@/types/gallery';
import { generateSEOMetadata } from '@/lib/metadata';

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    return generateSEOMetadata({
        title: t('home.seo.title', { defaultValue: 'Home - Portal da Cultura Japonesa' }),
        description: t('home.seo.description', {
            defaultValue: 'Descubra o Japão com NipponLife: notícias atualizadas, oportunidades de emprego, eventos culturais, guia de negócios e comunidade ativa.',
        }),
        locale,
        type: 'website',
        url: '',
        images: ['/images/logo-full.png'],
    });
}

export default async function HomePage() {
    const t = await getTranslations();

    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. Fetch News (Posts)
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id, title, excerpt, slug, created_at, cover_image_url,
            categories(name), title_ja, title_en, excerpt_ja, excerpt_en
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

    // 2. Fetch Businesses
    const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);


    // 5. Fetch Counts (Parallel)
    const [jobsRes, eventsRes, businessesRes] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('calendar_events').select('cover_image_url', { count: 'exact' }).eq('status', 'published').gte('starts_at', now).order('starts_at', { ascending: true }).limit(1),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'published')
    ]);

    const stats = {
        jobsCount: jobsRes.count || 0,
        eventsCount: eventsRes.count || 0,
        businessesCount: businessesRes.count || 0,
        closestEventImage: eventsRes.data?.[0]?.cover_image_url || null
    };

    // 4. Fetch Header Jobs (for small cards - limit 9)
    const { data: headerJobsData } = await supabase
        .from('jobs')
        .select(`
             id, title, company_name, location, prefecture, city,
             cover_image_url, created_at,
             pay_rate_yen, pay_unit, pay_text, salary_text
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(9);

    const headerJobs: FeaturedItem[] = (headerJobsData || []).map((job) => {
        const pref = job.prefecture && job.prefecture.toLowerCase() !== 'null' ? job.prefecture : null;
        const cty = job.city && job.city.toLowerCase() !== 'null' ? job.city : null;
        let finalLocation = pref ? `${pref}${cty ? `, ${cty}` : ''}` : (job.location && job.location.toLowerCase() !== 'null' ? job.location : 'JAPAN');
        if (!finalLocation) finalLocation = 'JAPAN';

        return {
            id: job.id,
            type: 'job',
            title: job.title,
            summary: `${job.company_name} • ${finalLocation}`,
            date: job.created_at,
            image: job.cover_image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
            category: 'vagas', // "Vagas" normalized
            slug: job.id,
            pay_rate_yen: job.pay_rate_yen,
            pay_unit: job.pay_unit,
            salary: job.salary_text || (job.pay_rate_yen ? `¥${job.pay_rate_yen.toLocaleString()}/${job.pay_unit || 'h'}` : job.pay_text),
        };
    });

    // 5. Fetch Premium Business (for large card - limit 1)
    const { data: premiumBusinessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'published')
        .eq('category', 'Premium')
        .order('created_at', { ascending: false })
        .limit(1);

    let premiumBusiness: FeaturedItem | null = null;
    if (premiumBusinessData && premiumBusinessData.length > 0) {
        const business = premiumBusinessData[0];
        premiumBusiness = {
            id: business.id,
            type: 'business',
            title: business.business_name,
            summary: business.description_short?.substring(0, 100) || '',
            date: business.created_at,
            image: business.logo_url || business.cover_image_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800',
            category: 'negocios-premium',
            slug: business.slug
        };
    }

    // 6. Fetch Community Post
    const { data: communityPosts } = await supabase
        .from('community_posts')
        .select(`
            id, title, excerpt, content, cover_image_url, view_count, like_count, slug,
            community_categories(name), title_ja, title_en, excerpt_ja, excerpt_en
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1);

    const communities: CommunityItem[] = (communityPosts || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.excerpt || post.content?.substring(0, 100) || '',
        members: post.view_count || 0,
        image: post.cover_image_url || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
        category: post.community_categories?.name || 'Geral',
        slug: post.slug,
        title_ja: post.title_ja,
        title_en: post.title_en,
        description_ja: post.excerpt_ja,
        description_en: post.excerpt_en
    }));

    // 7. Fetch Gallery Albums (Published only)
    // We try gallery_album_stats first, fallback to gallery_albums
    const { data: albumsRes } = await supabase
        .from('gallery_album_stats')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

    const galleryAlbums: GalleryAlbumWithStats[] = (albumsRes || []) as any;

    return (
        <div className="flex min-h-screen flex-col items-center bg-app">
            <div className="w-full">
                {/* Hero Section */}
                <HeroSection featuredNews={posts || []} stats={stats} />

                {/* Featured Highlights (Jobs & Premium Business) */}
                <section className="max-w-container mx-auto px-6 py-2">
                    <SectionHeader
                        title={t('home.sections.jobs', { defaultValue: 'Vagas em Destaque' })}
                        icon={<Briefcase className="w-5 h-5" />}
                        titleLink="/jobs"
                    />
                    <FeaturedHighlights premiumBusiness={premiumBusiness} headerJobs={headerJobs} />
                </section>

                {/* Business Carousel */}
                <Carousel
                    title={t('home.sections.businessGuide')}
                    sectionId="negocios"
                    icon={<Building2 className="w-5 h-5" />}
                    titleLink="/business"
                    containerClass="!px-6 !scroll-pl-6"
                >
                    {businesses && businesses.length > 0 ? (
                        businesses.map((business: Business) => (
                            <BusinessCard key={business.id} business={business} inCarousel={true} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-secondary">{t('home.empty.business')}</div>
                    )}
                </Carousel>

                {/* Communities Carousel */}
                <Carousel
                    title={t('home.sections.communities')}
                    sectionId="comunidades"
                    icon={<Users className="w-5 h-5" />}
                    titleLink="/comunidade"
                    containerClass="!px-6 !scroll-pl-6"
                >
                    {communities.map((item) => (
                        <CommunityCard key={item.id} item={item} />
                    ))}

                    <CommunityQuestionsCard />

                    <StatisticsCard item={featuredStatisticsCard} />
                </Carousel>

                {/* Gallery Section */}
                <section id="galeria" className="py-2 scroll-mt-24 max-w-container mx-auto px-6">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/galeria" className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-[var(--nl-surface)] border border-[var(--nl-border)] flex items-center justify-center text-[var(--nl-accent)] shadow-sm group-hover:scale-110 group-hover:bg-[var(--nl-accent)] group-hover:text-white transition-all duration-300">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h2 className="section-title mb-0 group-hover:text-[var(--nl-accent)] transition-colors">
                                {t('home.sections.gallery')}
                            </h2>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryAlbums.length > 0 ? (
                            galleryAlbums.map((album, index) => (
                                <div key={album.id} className={index === 2 ? 'hidden lg:block' : ''}>
                                    <GalleryAlbumCard album={album} isGrid />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-[var(--nl-secondary)] mb-6">
                                {t('gallery.noAlbums', { defaultMessage: 'Nenhum álbum disponível' })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Reels Section */}
                <section className="max-w-container mx-auto px-6 py-2">
                    <ReelsRow />
                </section>
            </div>
        </div>
    );
}

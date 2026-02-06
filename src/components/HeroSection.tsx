'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Flame, ArrowUpRight, Zap, Globe } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { storageService } from '@/lib/storageService';

interface HeroSectionProps {
    featuredNews: any[];
    stats: {
        jobsCount: number;
        eventsCount: number;
        businessesCount: number;
        businessesCountError?: boolean;
    };
}

export function HeroSection({ featuredNews, stats }: HeroSectionProps) {
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    // Carousel Logic
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Get top 3 news for the carousel
    const carouselItems = featuredNews ? featuredNews.slice(0, 3) : [];
    const activeItem = carouselItems[currentIndex];

    // Auto-rotate effect
    useEffect(() => {
        if (isHovered || carouselItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isHovered, carouselItems.length]);

    if (!activeItem) return null;

    // Get translated fields for active item
    const activeTitle = getTranslatedField(activeItem, 'title', locale);
    const activeSummary = getTranslatedField(activeItem, 'excerpt', locale) || activeItem.excerpt; // Fallback

    // Simple calendar logic for the mini-widget
    const today = new Date();
    const dayName = today.toLocaleDateString(locale, { weekday: 'long' });
    const dayNum = today.getDate();
    const monthName = today.toLocaleDateString(locale, { month: 'short' });

    return (
        <section className="py-6 md:py-10 bg-app overflow-hidden">
            <div className="max-w-container mx-auto px-6">
                {/* Header with Glassmorphism Ticker */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--nl-accent)] to-[#E60039] flex items-center justify-center shadow-lg shadow-red-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Flame className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-display font-black text-primary tracking-tight uppercase italic decoration-[var(--nl-accent)] decoration-4 underline-offset-8">
                                {t('home.hero.featuredTitle')}
                            </h2>
                            <p className="text-secondary text-xs font-medium uppercase tracking-[0.3em] opacity-60">
                                {t('home.hero.featuredSubtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Live Ticker */}
                    <div className="hidden lg:flex items-center gap-4 bg-surface border border-app px-4 py-2 rounded-full backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-0.5">Live Dashboard</span>
                        </div>
                        <div className="h-4 w-px bg-app/20" />
                        <span className="text-[10px] text-secondary font-medium uppercase tracking-wider line-clamp-1">
                            {stats.eventsCount} {t('home.stats.events')} • {stats.jobsCount} {t('home.stats.jobs')}
                        </span>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:auto-rows-[220px]">

                    {/* Main Feature - Carousel Box (Spans 8 columns, 2 rows) */}
                    <div
                        className="lg:col-span-8 lg:row-span-2 group relative rounded-[2.5rem] overflow-hidden border border-app shadow-2xl cursor-pointer bg-black/5 h-[350px] lg:h-auto"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => router.push(`/noticias/${activeItem.slug || ''}`)}
                    >
                        {/* Background Image with Transition */}
                        <div key={activeItem.id} className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                            <img
                                src={storageService.getFileUrl(activeItem.cover_image_url || activeItem.image)}
                                alt={activeTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out animate-fadeIn animate-kenBurns"
                            />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                        <div className="absolute top-5 left-5 md:top-8 md:left-8 flex flex-wrap items-center gap-2 md:gap-3 z-20">
                            <span className="px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-[var(--nl-accent)] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-red-600/30">
                                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                {t('news.featured')}
                            </span>
                            {/* Categories might be an array or object depending on join */}
                            <span className="px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-white/10 backdrop-blur-xl text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                {activeItem.categories?.name || t('news.general')}
                            </span>
                        </div>

                        {/* Content Container */}
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 z-20">
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex-1 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="flex items-center gap-3 text-white/50 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-3 md:mb-4">
                                        <ArrowUpRight className="w-3.5 md:w-4 h-3.5 md:h-4 text-[var(--nl-accent)]" />
                                        {new Date(activeItem.created_at || activeItem.date).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <h3
                                        key={`title-${activeItem.id}`}
                                        className="font-display text-2xl md:text-5xl font-black text-white mb-2 md:mb-4 text-shadow leading-[1.2] md:leading-[1.1] tracking-tight line-clamp-2 animate-fadeInSlideUp"
                                    >
                                        {activeTitle}
                                    </h3>
                                    <p
                                        key={`summary-${activeItem.id}`}
                                        className="text-white/70 text-xs md:text-lg line-clamp-2 md:line-clamp-2 font-medium max-w-2xl leading-relaxed animate-fadeInSlideUp delay-100"
                                    >
                                        {activeSummary}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Indicators - Bottom Right */}
                        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex gap-2">
                            {carouselItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                        ? 'w-8 bg-[var(--nl-accent)]'
                                        : 'w-2 bg-white/30 hover:bg-white/60'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mini Calendar Widget (Spans 4 columns, 1 row) */}
                    <div
                        className="lg:col-span-4 lg:row-span-1 bg-surface border border-app rounded-[2.5rem] p-7 flex flex-col justify-between group hover:border-[var(--nl-accent)]/30 transition-all duration-500 cursor-pointer overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-[var(--nl-accent)]/5"
                        onClick={() => router.push('/eventos')}
                    >
                        {/* Premium Gradient Background Decor */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[var(--nl-accent)]/10 to-transparent rounded-full blur-3xl group-hover:from-[var(--nl-accent)]/20 transition-all duration-700" />

                        <div className="flex justify-between items-start z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--nl-accent)] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nl-accent)]">Próximos</span>
                                </div>
                                <h4 className="text-primary font-black text-2xl leading-none mb-1 tracking-tight">{t('nav.events')}</h4>
                                <p className="text-secondary text-[11px] font-bold opacity-60 uppercase tracking-widest">{monthName} {today.getFullYear()}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white border border-app shadow-lg shadow-black/5 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--nl-accent)]" />
                                <span className="text-[var(--nl-accent)] font-black text-2xl leading-none mt-1">{dayNum}</span>
                                <span className="text-[10px] text-secondary font-black uppercase leading-none">{dayName.slice(0, 3)}</span>
                            </div>
                        </div>

                        <div className="z-10 mt-6 flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-bold text-primary tracking-tight">{stats.eventsCount} {t('home.sections.upcomingEvents')}</span>
                                </div>
                                <p className="text-[10px] text-secondary font-medium opacity-50 pl-6">Atualizado agora</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-[var(--nl-accent)] group-hover:text-white transition-all duration-500">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid (Spans 4 columns, 1 row) */}
                    <div className="lg:col-span-4 lg:row-span-1 grid grid-cols-2 gap-5">
                        {/* Jobs Stat */}
                        <div
                            className="bg-surface border border-app rounded-[2.5rem] p-7 flex flex-col justify-between hover:border-[var(--nl-accent)]/30 transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--nl-accent)]/5"
                            onClick={() => router.push('/vagas')}
                        >
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />

                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-black text-primary leading-none tracking-tighter mb-1">{stats.jobsCount}</p>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1 animate-pulse" />
                                </div>
                                <p className="text-[11px] font-black text-secondary opacity-60 uppercase tracking-[0.2em]">{t('home.stats.jobs')}</p>
                            </div>
                        </div>

                        {/* Business Stat */}
                        <div
                            className="bg-surface border border-app rounded-[2.5rem] p-7 flex flex-col justify-between hover:border-[var(--nl-accent)]/30 transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--nl-accent)]/5"
                            onClick={() => router.push('/business')}
                        >
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />

                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                <Globe className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-primary leading-none tracking-tighter mb-1">
                                    {stats.businessesCountError ? '-' : stats.businessesCount}
                                </p>
                                <p className="text-[11px] font-black text-secondary opacity-60 uppercase tracking-[0.2em]">{t('home.stats.businesses')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

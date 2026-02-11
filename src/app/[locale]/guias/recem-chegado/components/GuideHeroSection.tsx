'use client';

import { ArrowRight, Clock, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface GuideHeroSectionProps {
    locale: string;
}

export default function GuideHeroSection({ locale }: GuideHeroSectionProps) {
    const t = useTranslations();
    const [heroMedia, setHeroMedia] = useState<{ value: string, type: 'image' | 'video' | 'youtube', updated_at: string } | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [viewCount, setViewCount] = useState(0);

    useEffect(() => {
        // Fetch hero media from site settings
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/site-settings/newcomer_hero_media');
                if (response.ok) {
                    const data = await response.json();
                    if (data?.value) {
                        let type: 'image' | 'video' | 'youtube' = 'image';

                        if (data.type) {
                            type = data.type as 'image' | 'video' | 'youtube';
                        } else if (data.value.match(/\.(mp4|webm|ogg|mov)$/i)) {
                            type = 'video';
                        } else if (data.value.includes('youtube.com') || data.value.includes('youtu.be')) {
                            type = 'youtube';
                        }

                        setHeroMedia({
                            value: data.value,
                            type,
                            updated_at: data.updated_at
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading hero media:', error);
            }
        };

        const loadViews = async () => {
            try {
                // Fetch current views
                const response = await fetch('/api/site-settings/newcomer_guide_views');
                if (response.ok) {
                    const data = await response.json();
                    if (data?.views !== undefined) {
                        setViewCount(Number(data.views));
                    }
                }

                // Increment views (after initial render to avoid double counting on strict mode potentially, or just accept slightly inaccurate counts)
                // Using POST to increment
                const incResponse = await fetch('/api/site-settings/newcomer_guide_views', { method: 'POST' });
                if (incResponse.ok) {
                    const incData = await incResponse.json();
                    if (incData?.views !== undefined) {
                        setViewCount(Number(incData.views));
                    }
                }
            } catch (error) {
                console.error('Error loading views:', error);
            }
        };

        loadSettings();
        loadViews();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getYoutubeId = (url: string) => {
        return url.match(/(?:v=|\/)([\w-]{11})(?:\?|\&|\/|$)/)?.[1];
    };

    return (
        <section className="py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-secondary text-[10px] font-black uppercase tracking-widest">
                                {t('guides.hero.badge')}
                            </span>
                            {viewCount > 0 && (
                                <span className="text-[10px] text-muted font-bold uppercase tracking-tight">
                                    {viewCount.toLocaleString(locale)} {t('guides.views')}
                                </span>
                            )}
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
                            {t('guides.hero.title')}{' '}
                            <span className="text-accent">{t('guides.hero.titleHighlight')}</span>
                        </h1>

                        <p className="text-secondary text-base md:text-lg leading-relaxed mb-8 max-w-lg font-medium">
                            {t('guides.hero.description')}
                        </p>

                        <Link
                            href="/comunidade/duvidas"
                            className="btn-primary inline-flex items-center gap-2 group bg-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/20"
                        >
                            {t('guides.hero.cta')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="relative">
                            <div className="bg-white dark:bg-surface border border-gray-200 dark:border-app rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-gradient-to-br from-[#003768]/20 to-[#5593C3]/20 flex items-center justify-center relative">
                                {heroMedia ? (
                                    heroMedia.type === 'youtube' ? (
                                        <div className="w-full h-full absolute inset-0">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${getYoutubeId(heroMedia.value)}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=${isMuted ? 0 : 1}&loop=1&playlist=${getYoutubeId(heroMedia.value)}&rel=0&showinfo=0&playsinline=1`}
                                                title="YouTube video"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className={`w-full h-full border-0 ${isMuted ? 'pointer-events-none' : ''}`}
                                            />
                                        </div>
                                    ) : heroMedia.type === 'video' ? (
                                        <video
                                            src={heroMedia.value}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted={isMuted}
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={heroMedia.value}
                                            alt="Destaque"
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[var(--nl-accent)]/10 flex items-center justify-center">
                                            <span className="text-5xl">🇯🇵</span>
                                        </div>
                                        <p className="font-heading font-semibold text-[#003768] dark:text-primary text-lg">
                                            {t('guides.hero.fallbackTitle')}
                                        </p>
                                        <p className="text-gray-600 dark:text-secondary text-sm mt-1">
                                            {t('guides.hero.fallbackSubtitle')}
                                        </p>
                                    </div>
                                )}

                                {heroMedia?.type === 'youtube' && isMuted && <div className="absolute inset-0 bg-transparent" />}

                                {(heroMedia?.type === 'video' || heroMedia?.type === 'youtube') && (
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
                                        aria-label={isMuted ? t('guides.hero.unmute') : t('guides.hero.mute')}
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            {heroMedia && heroMedia.updated_at && (
                                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 shadow-lg z-10 transition-all hover:bg-black/80">
                                    <div className="flex items-center gap-2 text-white/90 text-[10px] sm:text-xs font-medium">
                                        <Clock className="w-3 h-3 text-white" />
                                        <span>{t('guides.hero.updated')}: {formatDate(heroMedia.updated_at)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}

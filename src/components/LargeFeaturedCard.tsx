'use client';

import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar } from 'lucide-react';
import { getTranslatedField, normalizeCategorySlug } from '@/lib/getTranslatedField';
import { storageService } from '@/lib/storageService';

export interface FeaturedItem {
    id: string;
    type?: 'job' | 'business' | 'community' | 'event' | 'news';
    title: string;
    summary: string;
    date: string;
    image: string;
    category: string;
    slug?: string;
    title_ja?: string;
    title_en?: string;
    summary_ja?: string;
    summary_en?: string;
    salary?: string;
    pay_rate_yen?: number;
}

interface LargeFeaturedCardProps {
    item: FeaturedItem;
}

export function LargeFeaturedCard({ item }: LargeFeaturedCardProps) {
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    const title = getTranslatedField(item, 'title', locale);
    const summary = getTranslatedField(item, 'summary', locale);

    const handleClick = () => {
        // Navigate based on content type
        switch (item.type) {
            case 'job':
                router.push({ pathname: '/jobs', query: { selectedJobId: item.slug } } as any); // Adapt route if needed
                break;
            case 'business':
                router.push(`/business/${item.slug}`);
                break;
            case 'community':
                router.push(`/comunidade/${item.slug}`);
                break;
            case 'event':
                router.push(`/eventos/${item.slug}`);
                break;
            default:
                router.push(`/noticias/${item.slug}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-accent/20 transition-all duration-500 bg-surface border border-app"
        >
            {/* Background Image */}
            <Image
                src={storageService.getFileUrl(item.image)}
                alt={title}
                fill
                priority
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 100vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Business Guide Badge - Top Right */}
            {item.type === 'business' && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--nl-accent)] to-[var(--nl-accent-dark)] text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm border border-white/20">
                    📋 {t('home.hero.businessGuideBadge', { defaultMessage: 'Business Guide' })}
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--nl-accent)] text-white text-xs font-bold uppercase tracking-widest mb-4">
                    {t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                </div>

                {/* Title */}
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 line-clamp-2 group-hover:text-[var(--nl-accent)] transition-colors duration-300">
                    {title}
                </h2>

                {/* Summary */}
                <p className="text-gray-200 text-lg mb-4 line-clamp-2 max-w-3xl">
                    {summary}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                        {new Date(item.date).toLocaleDateString(locale, {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-3xl transition-all duration-300" />
        </div>
    );
}

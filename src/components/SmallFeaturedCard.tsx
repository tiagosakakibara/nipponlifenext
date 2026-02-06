'use client';

import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar } from 'lucide-react';
import { getTranslatedField, normalizeCategorySlug } from '@/lib/getTranslatedField';
import { storageService } from '@/lib/storageService';
import { FeaturedItem } from './LargeFeaturedCard';

interface SmallFeaturedCardProps {
    item: FeaturedItem;
    className?: string;
}

export function SmallFeaturedCard({ item, className = '' }: SmallFeaturedCardProps) {
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    const title = getTranslatedField(item, 'title', locale);

    const handleClick = () => {
        switch (item.type) {
            case 'job':
                router.push({ pathname: '/jobs', query: { selectedJobId: item.slug } } as any);
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
            className={`group relative h-[350px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-accent/20 transition-all duration-500 bg-surface border border-app ${className}`}
        >
            {/* Image */}
            <div className="relative h-[200px] overflow-hidden">
                <img
                    src={storageService.getFileUrl(item.image)}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay on Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[var(--nl-accent)] text-white text-[10px] font-bold uppercase tracking-widest">
                    {t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--nl-primary)] mb-3 line-clamp-2 group-hover:text-[var(--nl-accent)] transition-colors duration-300">
                    {title}
                </h3>

                {/* Date */}
                <div className="flex items-center gap-2 text-[var(--nl-secondary)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">
                        {new Date(item.date).toLocaleDateString(locale, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-2xl transition-all duration-300" />
        </div>
    );
}

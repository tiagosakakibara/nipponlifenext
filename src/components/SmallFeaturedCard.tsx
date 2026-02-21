'use client';

import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, MapPin } from 'lucide-react';
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
                <Image
                    src={storageService.getFileUrl(item.image)}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay on Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[var(--nl-accent)] text-white text-[10px] font-bold uppercase tracking-widest z-10">
                    {t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                </div>


            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 h-[150px]">
                {/* Top Row: Title & Salary */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[var(--nl-primary)] line-clamp-2 leading-tight group-hover:text-[var(--nl-accent)] transition-colors duration-300">
                            {title}
                        </h3>
                    </div>
                    {item.type === 'job' && item.salary && (
                        <div className="text-right shrink-0">
                            <span className="text-xl font-black text-[var(--nl-primary)] tracking-tight leading-none block">
                                {item.salary.includes('¥') ? '' : '¥'}{item.salary.split('/')[0].replace('¥', '').trim()}
                            </span>
                            <span className="text-[9px] font-bold text-[var(--nl-secondary)] uppercase tracking-wider block mt-0.5">
                                {t('jobs.salaryLabel', { defaultValue: 'Valor da Hora' })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom Row: Location & Date */}
                <div className="mt-auto flex items-end justify-between gap-2 border-t border-[var(--nl-primary)]/5 pt-3">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[var(--nl-accent)]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold line-clamp-1 uppercase tracking-wider">
                                {item.summary.split('•')[1]?.trim() || t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--nl-secondary)] opacity-80">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">
                                {new Date(item.date).toLocaleDateString(locale, {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-2xl transition-all duration-300" />
        </div>
    );
}

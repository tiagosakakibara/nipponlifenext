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
                <div className={`absolute top-4 left-4 px-3 py-1 ${item.type === 'job' ? 'bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-sm' : 'bg-[#D70F24] rounded-lg'} text-white text-[10px] font-bold uppercase tracking-widest z-10`}>
                    {t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                </div>


            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 bg-white h-[150px]">
                {/* Top Row: Title & Salary */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className={`font-black text-[#002B52] leading-none mb-1 group-hover:text-[#D70F24] transition-colors tracking-tight ${item.type === 'job' ? 'text-lg md:text-xl line-clamp-1' : 'text-base line-clamp-2'}`}>
                            {title}
                        </h3>
                        {item.type === 'job' && (
                            <p className="text-sm md:text-[15px] font-medium text-[#1872B6] mt-1 line-clamp-1">
                                {item.summary?.split('•')[0]?.trim() || t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category })}
                            </p>
                        )}
                    </div>
                    {item.type === 'job' && item.salary && (
                        <div className="text-right shrink-0 flex flex-col justify-center">
                            <span className="text-xl md:text-2xl font-black text-[#002B52] tracking-tight leading-none block">
                                {item.salary.includes('¥') ? '' : '¥'}{item.salary.split('/')[0].replace('¥', '').trim()}
                            </span>
                            <span className="text-[10px] font-bold text-[#1872B6] uppercase tracking-wider block mt-1">
                                {t('jobs.salaryLabel', { defaultValue: 'Valor da Hora' })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="w-full h-px bg-gray-200 mt-auto mb-3" />

                {/* Bottom Row: Location & Date */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[#D70F24]">
                            <MapPin className="w-4 h-4 md:w-4 md:h-4 stroke-[2.5]" />
                            <span className="text-xs md:text-[13px] font-bold line-clamp-1 uppercase tracking-wider">
                                {item.type === 'job' ? (item.summary?.split('•')[1]?.trim() || 'JAPAN') : (item.summary?.split('•')[1]?.trim() || t(`categories.${normalizeCategorySlug(item.category)}`, { defaultMessage: item.category }))}
                            </span>
                        </div>
                    </div>
                    {item.type !== 'job' && (
                        <div className="flex items-center gap-1.5 text-[#1872B6] opacity-80">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">
                                {new Date(item.date).toLocaleDateString(locale, {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-2xl transition-all duration-300" />
        </div>
    );
}

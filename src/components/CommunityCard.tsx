'use client';

import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Eye } from 'lucide-react';
import { getTranslatedField, normalizeCategorySlug } from '@/lib/getTranslatedField';
import { storageService } from '@/lib/storageService';

export interface CommunityItem {
    id: string;
    title: string;
    description?: string;
    members: number; // View count or similar
    image: string;
    category: string;
    slug?: string;
    // translations
    title_ja?: string;
    title_en?: string;
    description_ja?: string;
    description_en?: string;
}

interface CommunityCardProps {
    item: CommunityItem;
    featured?: boolean;
}

export function CommunityCard({ item, featured }: CommunityCardProps) {
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    const handleClick = () => {
        if (item.slug) {
            router.push(`/comunidade/${item.slug}`);
        }
    };

    return (
        <div
            className={`carousel-item cursor-pointer ${featured ? 'w-80 md:w-96' : 'w-[280px] md:w-[301px]'} group shrink-0`}
            onClick={handleClick}
        >
            <div className="relative h-[350px] w-full rounded-3xl overflow-hidden hover-lift shadow-lg hover:shadow-accent/20 transition-all duration-500 border border-white/10">
                {/* Full Background Image */}
                <Image
                    src={storageService.getFileUrl(item.image)}
                    alt={getTranslatedField(item, 'title', locale)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay - Darker at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Badge */}
                    <div className="mb-auto pt-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 uppercase tracking-widest hover:bg-white/30 transition-colors">
                            {t(`community.categories.${normalizeCategorySlug(item.category)}`)}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-3 leading-tight drop-shadow-sm group-hover:text-accent transition-colors duration-300">
                        {getTranslatedField(item, 'title', locale)}
                    </h3>

                    {/* Meta Info (Views/Date) */}
                    <div className="flex items-center gap-2 text-white/80 text-xs font-medium border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{item.members.toLocaleString(locale)} {t('common.views')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ResponsiveImage } from './ResponsiveImage';

export interface StatisticsCardItem {
    title: string;
    description: string;
    image_url: string;
    link: string;
    updated_at?: string;
    source?: string;
}

interface StatisticsCardProps {
    item: StatisticsCardItem;
    onClick?: () => void;
}

export function StatisticsCard({ item, onClick }: StatisticsCardProps) {
    const t = useTranslations();
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (item.link) {
            router.push(item.link);
        }
    };

    return (
        <div className="carousel-item w-[280px] md:w-[301px] group cursor-pointer shrink-0" onClick={handleClick}>
            <div className="relative h-[350px] w-full rounded-3xl overflow-hidden hover-lift shadow-lg hover:shadow-accent/20 transition-all duration-500 border border-white/10">
                {/* Full Background Image */}
                <ResponsiveImage
                    src={item.image_url}
                    alt={t('home.statistics.title')}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Badge */}
                    <div className="mb-auto pt-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 uppercase tracking-widest hover:bg-white/30 transition-colors">
                            {t('home.sections.statistics')}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight drop-shadow-sm group-hover:text-accent transition-colors duration-300">
                        {t('home.statistics.title')}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed drop-shadow-md">
                        {t('home.statistics.description')}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                        <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
                            {t('home.statistics.source')}
                        </span>
                        <div className="text-[10px] font-bold text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                            {t('home.statistics.view')} &rarr;
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

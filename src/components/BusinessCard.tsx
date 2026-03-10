import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Business } from '@/types/business';
import { getTranslatedField } from '@/lib/getTranslatedField';

interface BusinessCardProps {
    business: Business;
    inCarousel?: boolean;
}

export function BusinessCard({ business, inCarousel = false }: BusinessCardProps) {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <Link
            href={`/business/${business.slug}`}
            className={`${inCarousel ? 'carousel-item w-[280px] md:w-[301px]' : 'w-full'} group bg-surface border border-app rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-500 hover:shadow-lg hover:shadow-accent/20 flex flex-col h-[420px]`}
        >
            {/* Cover Image */}
            <div className="relative h-[200px] overflow-hidden shrink-0 bg-surface">
                {business.cover_image_url ? (
                    <Image
                        src={business.cover_image_url}
                        alt={getTranslatedField(business, 'business_name', locale)}
                        fill
                        className="object-contain transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-surface border-b border-app flex items-center justify-center text-muted">
                        <span className="text-3xl font-display">NL</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {business.featured && (
                        <span className="bg-accent text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg tracking-widest shadow-sm">
                            {t('business.premium', { defaultMessage: 'Premium' })}
                        </span>
                    )}
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border border-white/20 tracking-widest">
                        {t(`business.categories.${business.category}`, { defaultMessage: business.category })}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
                    {getTranslatedField(business, 'business_name', locale)}
                </h3>

                <p className="text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
                    {getTranslatedField(business, 'description_short', locale)}
                </p>

                <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center gap-2 text-secondary">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">
                            {getTranslatedField(business, 'city', locale)}, {getTranslatedField(business, 'prefecture', locale)}
                        </span>
                    </div>

                    {/* Opening Status */}
                    {(() => {
                        const hours = business.opening_hours;
                        if (!hours) return null;

                        const now = new Date();
                        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                        const dayKey = days[now.getDay()];
                        const timeRange = hours[dayKey];

                        if (!timeRange) {
                            return (
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1.5 ml-auto">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    {t('business.closed', { defaultValue: 'Fechado' })}
                                </span>
                            );
                        }

                        const [start, end] = timeRange.split(' - ');
                        if (!start || !end) return null;

                        const [startH, startM] = start.split(':').map(Number);
                        const [endH, endM] = end.split(':').map(Number);

                        const currentH = now.getHours();
                        const currentM = now.getMinutes();

                        const currentTotal = currentH * 60 + currentM;
                        const startTotal = startH * 60 + startM;
                        const endTotal = endH * 60 + endM;

                        const isOpen = currentTotal >= startTotal && currentTotal < endTotal;

                        return (
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ml-auto ${isOpen ? 'text-emerald-500' : 'text-accent'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-accent'}`} />
                                {isOpen ? t('business.open', { defaultValue: 'Aberto' }) : t('business.closed', { defaultValue: 'Fechado' })}
                            </span>
                        );
                    })()}
                </div>
            </div>
        </Link>
    );
}

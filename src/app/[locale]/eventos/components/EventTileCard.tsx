'use client';

import { Calendar, MapPin, Info } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Event } from '@/types/event';
import { Link } from '@/i18n/routing';

interface EventTileCardProps {
    event: Event;
}

export function EventTileCard({ event }: EventTileCardProps) {
    const locale = useLocale();
    const rawDate = new Date(event.starts_at);
    // Force JST (UTC+9) for display
    const date = new Date(rawDate.getTime() + 9 * 60 * 60 * 1000);

    // Helper to get translated field
    const getTranslatedField = (field: 'title' | 'location' | 'description'): string => {
        if (locale === 'ja') {
            const jaField = event[`${field}_ja` as keyof Event];
            if (jaField) return jaField as string;
        }

        if (locale === 'en') {
            const enField = event[`${field}_en` as keyof Event];
            if (enField) return enField as string;
        }

        return (event[field] as string) || '';
    };

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');

    const cover = event.cover_image_url?.trim();
    const hasImage = !!cover && cover.startsWith('http');

    const href = event.slug ? `/eventos/${event.slug}` : `/eventos/id/${event.id}`;

    return (
        <Link
            href={href}
            className={`
                group relative overflow-hidden rounded-[32px] border border-app cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-surface
                ${hasImage ? 'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[380px]' : 'col-span-1 min-h-[220px]'}
            `}
        >
            {hasImage ? (
                <>
                    <div className="absolute inset-0">
                        <img
                            src={cover}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    </div>

                    <div className="relative h-full p-8 flex flex-col justify-end text-white">
                        <div className="mb-auto flex justify-between items-start">
                            <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                                <span className="text-xl font-heading font-black">{day}</span>
                                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-80">{month}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                                <Info className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-3xl font-heading font-bold leading-tight line-clamp-2">
                                {getTranslatedField('title')}
                            </h3>

                            <div className="flex flex-wrap items-center gap-6">
                                {event.location && (
                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                        <MapPin className="w-4 h-4 text-[#D70F24]" />
                                        <span className="font-medium tracking-wide">{getTranslatedField('location')}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                    <Calendar className="w-4 h-4 text-[#D70F24]" />
                                    <span className="font-medium tracking-wide">
                                        {date.toLocaleTimeString(locale, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full p-8 flex flex-col relative overflow-hidden bg-white dark:bg-zinc-900/50">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#D70F24]" />

                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                            <span className="text-5xl font-heading font-black text-primary leading-none">
                                {day}
                            </span>
                            <span className="text-sm font-bold text-[#D70F24] uppercase tracking-[0.2em] mt-1 pl-1">
                                {month}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-heading font-bold text-primary mb-4 line-clamp-3 leading-tight group-hover:text-[#D70F24] transition-colors">
                            {getTranslatedField('title')}
                        </h3>

                        {event.location && (
                            <div className="mt-auto flex items-center gap-2 text-sm text-secondary font-medium">
                                <MapPin className="w-4 h-4 text-[#D70F24]/60" />
                                {getTranslatedField('location')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Link>
    );
}

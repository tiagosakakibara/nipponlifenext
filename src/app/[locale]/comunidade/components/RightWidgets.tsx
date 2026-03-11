'use client';

import { useRouter, Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { ChevronRight } from 'lucide-react';

export interface CommunityEvent {
    id: string;
    title: string;
    title_en?: string;
    title_ja?: string;
    location: string;
    starts_at: string;
    slug: string;
}

interface RightWidgetsProps {
    events: CommunityEvent[];
}

export function RightWidgets({ events }: RightWidgetsProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    const formatDay = (dateString: string) => {
        return new Date(dateString).getDate();
    };

    const formatMonth = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale, { month: 'short' }).replace('.', '');
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Estatísticas Widget */}
            <Link href="/statistics" className="block relative bg-[#003768] rounded-2xl p-6 overflow-hidden group hover:shadow-md transition-all">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <h3 className="relative font-['Montserrat'] font-bold text-white text-lg leading-tight mb-2">
                    {t('home.sections.statistics', { defaultMessage: 'Estatísticas' })}
                </h3>
                <p className="relative text-white/80 text-xs mb-6 max-w-[90%]">
                    {t('statistics.hero.subtitle', { defaultMessage: 'Explore dados demográficos, distribuição regional e tendências do Japão.' })}
                </p>

                <div className="relative bg-white text-[#003768] py-2.5 px-4 rounded-xl text-xs font-bold w-full text-center group-hover:bg-[#f0f2f5] transition-colors flex items-center justify-center gap-1.5">
                    {t('common.access', { defaultMessage: 'Acessar' })}
                    <ChevronRight className="w-4 h-4" />
                </div>
            </Link>

            {/* Eventos Próximos */}
            <div className="bg-surface rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-['Montserrat'] font-bold text-primary text-sm mb-4">{t('community.widgets.upcomingEvents', { defaultMessage: 'Eventos Próximos' })}</h3>

                {events.length > 0 ? (
                    <div className="flex flex-col gap-4 mb-4">
                        {events.map((event, index) => {
                            const isEven = index % 2 === 0;
                            const colorClass = isEven ? 'text-[var(--nl-accent)]' : 'text-[var(--nl-link)]';
                            const bgClass = isEven ? 'bg-[var(--nl-accent)]/10' : 'bg-[var(--nl-link)]/10';
                            const groupHoverClass = isEven ? 'group-hover:text-[var(--nl-accent)]' : 'group-hover:text-[var(--nl-link)]';

                            return (
                                <div
                                    key={event.id}
                                    onClick={() => router.push(`/eventos/${event.slug}`)}
                                    className="flex gap-3 items-start group cursor-pointer"
                                    role="button"
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 ${bgClass} rounded-xl flex flex-col items-center justify-center ${colorClass}`}>
                                        <span className="text-[10px] font-bold uppercase">{formatMonth(event.starts_at)}</span>
                                        <span className="text-lg font-bold leading-none">{formatDay(event.starts_at)}</span>
                                    </div>
                                    <div>
                                        <h4 className={`font-['DM_Sans'] font-bold text-sm text-primary transition-colors leading-tight mb-1 ${groupHoverClass}`}>
                                            {getTranslatedField(event, 'title', locale)}
                                        </h4>
                                        <p className="text-xs text-muted truncate max-w-[180px]">{event.location}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-muted text-center py-4 mb-4">
                        {t('community.widgets.noEvents', { defaultMessage: 'Nenhum evento próximo agendado.' })}
                    </div>
                )}

                <Link 
                    href="/eventos" 
                    className="w-full py-2.5 rounded-xl border border-app text-primary text-xs font-bold hover:bg-app transition-colors inline-block text-center"
                >
                    {t('community.widgets.viewAll', { defaultMessage: 'Ver todos' })}
                </Link>
            </div>

            {/* Contribuidores */}
            <div className="bg-surface rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-['Montserrat'] font-bold text-primary text-sm mb-4">{t('community.widgets.contributors', { defaultMessage: 'Contribuidores' })}</h3>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((i) => (
                        <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${i}`}
                            alt="Contributor"
                            className="w-10 h-10 rounded-full border-2 border-app ring-1 ring-app"
                        />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-app border border-app flex items-center justify-center text-[10px] font-bold text-muted">
                        +254
                    </div>
                </div>
            </div>
        </div>
    );
}

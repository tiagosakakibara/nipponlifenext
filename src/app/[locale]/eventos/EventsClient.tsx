'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Search, Loader2, ChevronDown, CalendarDays, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { eventService } from '@/lib/eventService';
import { Event } from '@/types/event';
import { useRouter, useSearchParams } from 'next/navigation';
import RequestAccessButton from '@/components/access/RequestAccessButton';
import EventAccessButton from './EventAccessButton';

import 'temporal-polyfill/global';

export default function EventsClient() {
    const t = useTranslations('eventsCalendar');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Japan Time Helper (Temporal is now globally available via temporal-polyfill/global)
    const japanCurrentYear = typeof window !== 'undefined'
        ? Temporal.Now.zonedDateTimeISO('Asia/Tokyo').year
        : new Date().getFullYear();

    // State
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    // Filters from URL or default
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [searchDebounced, setSearchDebounced] = useState(search);
    const [selectedMonth, setSelectedMonth] = useState<number | ''>(searchParams.get('month') ? Number(searchParams.get('month')) : '');
    const [selectedYear, setSelectedYear] = useState<number>(searchParams.get('year') ? Number(searchParams.get('year')) : japanCurrentYear);
    const [page, setPage] = useState(1);

    const pageSize = 100;

    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounced(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const lastRequestRef = useRef<number>(0);

    const fetchEvents = async (reset = false) => {
        const requestId = ++lastRequestRef.current;
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const currentOffset = reset ? 0 : (page - 1) * pageSize;

            const response = await eventService.getEventsPaged({
                search: searchDebounced,
                month: selectedMonth === '' ? undefined : Number(selectedMonth),
                year: selectedYear === 0 ? undefined : selectedYear,
                limit: pageSize,
                offset: currentOffset
            });

            // Only update if this is still the latest request
            if (requestId !== lastRequestRef.current) return;

            if (reset) {
                setEvents((response.events || []).filter(Boolean));
            } else {
                setEvents(prev => {
                    const newEvents = (response.events || []).filter(e => e && !prev.some(p => p.id === e.id));
                    return [...prev, ...newEvents];
                });
            }

            setHasMore(response.hasMore);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            if (requestId === lastRequestRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    };

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchDebounced) params.set('q', searchDebounced);
        if (selectedMonth) params.set('month', selectedMonth.toString());
        if (selectedYear) params.set('year', selectedYear.toString());

        const query = params.toString();
        router.push(`/eventos${query ? `?${query}` : ''}`, { scroll: false });
    }, [searchDebounced, selectedMonth, selectedYear, router]);

    // Initial Load & Filter Changes
    useEffect(() => {
        setPage(1);
        fetchEvents(true);
    }, [searchDebounced, selectedMonth, selectedYear]);

    // Grouping Logic for list view
    const groupedEvents = useMemo(() => {
        const groups: { [key: string]: Event[] } = {};
        (events || []).filter(e => e && e.starts_at).forEach(event => {
            const rawDate = new Date(event.starts_at);
            // Transform to JST (UTC+9) for grouping
            const date = new Date(rawDate.getTime() + 9 * 60 * 60 * 1000);

            const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(event);
        });
        return groups;
    }, [events]);

    const formatMonthHeader = (monthKey: string) => {
        const [year, monthIndex] = monthKey.split('-');
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const monthName = t(`months.${monthNames[Number(monthIndex)]}`);
        return `${monthName.toUpperCase()} ${year}`;
    };

    const months = [
        { value: '', label: t('allMonths') },
        { value: 1, label: t('months.january') },
        { value: 2, label: t('months.february') },
        { value: 3, label: t('months.march') },
        { value: 4, label: t('months.april') },
        { value: 5, label: t('months.may') },
        { value: 6, label: t('months.june') },
        { value: 7, label: t('months.july') },
        { value: 8, label: t('months.august') },
        { value: 9, label: t('months.september') },
        { value: 10, label: t('months.october') },
        { value: 11, label: t('months.november') },
        { value: 12, label: t('months.december') },
    ];

    const currentYear = new Date().getFullYear();
    const years = [
        { value: 0, label: t('allYears') },
        { value: currentYear - 1, label: (currentYear - 1).toString() },
        { value: currentYear, label: currentYear.toString() },
        { value: currentYear + 1, label: (currentYear + 1).toString() },
        { value: currentYear + 2, label: (currentYear + 2).toString() },
    ];

    return (
        <div className="min-h-screen bg-app">
            {/* Hero Section */}
            <section className="relative py-6 md:min-h-[230px] h-auto md:pt-20 overflow-hidden bg-surface border-b border-app">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <CalendarDays className="w-3 h-3" />
                            {t('titleHighlight')}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary tracking-tight leading-tight">
                            {t('title')} <span className="text-[#D70F24]">{t('titleHighlight')}</span>
                        </h1>
                        <p className="text-base text-secondary font-medium max-w-lg">
                            {events.length > 0
                                ? "Confira os principais eventos e encontros da nossa comunidade no Japão."
                                : t('noEventsDescription')}
                        </p>
                        <div className="pt-4">
                            <EventAccessButton />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Bar */}
            <section className="relative lg:sticky lg:top-[52px] z-30 bg-surface/80 backdrop-blur-xl border-b border-app shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-[#D70F24] transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-11 pr-6 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="px-5 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none pr-10 min-w-[140px]"
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="px-5 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none pr-10 min-w-[100px]"
                                >
                                    {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-6 md:py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-[#D70F24] animate-spin" />
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">{t('loading')}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-app rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-8 h-8 text-muted" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-primary mb-2">{t('noEventsTitle')}</h3>
                        <p className="text-secondary mb-8">{t('noEventsDescription')}</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedMonth(''); setSelectedYear(japanCurrentYear); }}
                            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            {t('clearFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => (
                            <section key={monthKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-6 mb-10 overflow-hidden">
                                    <h2 className="text-2xl font-heading font-bold text-primary uppercase tracking-tight whitespace-nowrap">
                                        {formatMonthHeader(monthKey)}
                                    </h2>
                                    <div className="h-px w-full bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />
                                </div>

                                <div className="overflow-hidden bg-surface border border-app rounded-2xl shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#00376805] text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app hidden md:table-header-group">
                                            <tr>
                                                <th className="px-6 py-5 whitespace-nowrap">Event Showcase</th>
                                                <th className="px-6 py-5 whitespace-nowrap">Schedule</th>
                                                <th className="px-6 py-5 whitespace-nowrap">Location</th>
                                                <th className="px-6 py-5 whitespace-nowrap text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-app">
                                            {monthEvents.map((event) => {
                                                const startDate = new Date(event.starts_at);
                                                const dateStr = startDate.toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                });
                                                const timeStr = startDate.toLocaleTimeString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });

                                                const eventLink = event.slug ? `/eventos/${event.slug}` : `/eventos/id/${event.id}`;

                                                return (
                                                    <tr
                                                        key={event.id}
                                                        onClick={() => router.push(eventLink)}
                                                        className="group hover:bg-[#00376805] cursor-pointer transition-colors flex flex-col md:table-row relative"
                                                    >
                                                        <td className="px-6 py-4 align-middle">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative w-16 h-16 md:w-14 md:h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-app shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                                    {event.cover_image_url ? (
                                                                        <Image // eslint-disable-line
                                                                            src={event.cover_image_url}
                                                                            alt={event.title}
                                                                            fill
                                                                            className="object-cover"
                                                                            sizes="56px"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-secondary/20 bg-app">
                                                                            <CalendarDays className="w-6 h-6" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col justify-center min-w-0">
                                                                    <span className="font-bold text-primary text-base md:text-sm line-clamp-2 md:line-clamp-1 group-hover:text-[#5593C3] transition-colors leading-tight mb-1">
                                                                        {event.title}
                                                                    </span>
                                                                    <span className="text-[10px] text-secondary/50 uppercase tracking-widest line-clamp-1 font-mono">
                                                                        {event.slug || event.id}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2 md:py-4 align-middle pl-[88px] md:pl-6 -mt-2 md:mt-0">
                                                            <div className="flex flex-row md:flex-col gap-3 md:gap-1 items-center md:items-start text-sm md:text-xs">
                                                                <div className="flex items-center gap-2 font-bold text-primary/80">
                                                                    <CalendarIcon className="w-3.5 h-3.5 text-[#5593C3]" />
                                                                    {dateStr}
                                                                </div>
                                                                <div className="flex items-center gap-2 font-black text-secondary/50 uppercase tracking-widest text-[10px]">
                                                                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary/30" />
                                                                    </div>
                                                                    {timeStr}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2 md:py-4 align-middle pl-[88px] md:pl-6 mb-4 md:mb-0">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-tight">
                                                                <div className="w-3.5 h-3.5 flex items-center justify-center text-[#5593C3]">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                                                </div>
                                                                <span className="truncate max-w-[200px]">{event.location || 'Local TBD'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 align-middle text-right hidden md:table-cell">
                                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-app group-hover:bg-[#5593C3] text-secondary group-hover:text-white transition-all -ml-2 group-hover:ml-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                                                <ChevronLeft className="w-4 h-4 rotate-180" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={loadingMore}
                                    className="px-8 py-4 rounded-2xl bg-surface border border-app text-primary font-bold text-xs uppercase tracking-widest hover:bg-app transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#D70F24]" />}
                                    {loadingMore ? t('loading') : t('loadMore')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

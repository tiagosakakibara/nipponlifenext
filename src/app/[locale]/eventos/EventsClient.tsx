'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Calendar as CalendarIcon, Loader2, ChevronDown, LayoutGrid, Filter, CalendarDays } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { eventService } from '@/lib/eventService';
import { Event } from '@/types/event';
import { EventTileCard } from './components/EventTileCard';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

declare global {
    interface Window {
        Temporal: any;
    }
}

// Schedule-X needs to be client-side only
const ScheduleXCalendar = dynamic(
    () => import('@schedule-x/react').then(mod => mod.ScheduleXCalendar),
    { ssr: false }
);

// Polyfill for Temporal if not available
if (typeof window !== 'undefined' && !window.Temporal) {
    require('temporal-polyfill/global');
}

import {
    createViewMonthGrid,
    createViewMonthAgenda,
    createViewWeek,
    createViewDay
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { useCalendarApp } from '@schedule-x/react';

import '@schedule-x/theme-default/dist/index.css';

export default function EventsClient() {
    const t = useTranslations('eventsCalendar');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Japan Time Helper
    // @ts-ignore
    const nowJapan = typeof window !== 'undefined' ? (window.Temporal ? Temporal.Now.zonedDateTimeISO('Asia/Tokyo') : { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }) : { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
    const japanCurrentYear = nowJapan.year;

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
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>((searchParams.get('view') as 'calendar' | 'list') || 'calendar');

    const calendarEventsService = useMemo(() => createEventsServicePlugin(), []);
    const pageSize = 20;

    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounced(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Data Fetching
    const fetchEvents = async (reset = false) => {
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
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchDebounced) params.set('q', searchDebounced);
        if (selectedMonth) params.set('month', selectedMonth.toString());
        if (selectedYear) params.set('year', selectedYear.toString());
        if (viewMode !== 'calendar') params.set('view', viewMode);

        const query = params.toString();
        router.push(`/eventos${query ? `?${query}` : ''}`, { scroll: false });
    }, [searchDebounced, selectedMonth, selectedYear, viewMode, router]);

    // Initial Load & Filter Changes
    useEffect(() => {
        setPage(1);
        fetchEvents(true);
    }, [searchDebounced, selectedMonth, selectedYear]);

    // Format events for Schedule-X
    const formattedEvents = useMemo(() => {
        return (events || [])
            .filter(e => e && e.starts_at)
            .map(event => {
                try {
                    const date = new Date(event.starts_at);
                    if (isNaN(date.getTime())) return null;

                    const formatDateString = (d: Date) => {
                        const yr = d.getFullYear();
                        const mo = String(d.getMonth() + 1).padStart(2, '0');
                        const dy = String(d.getDate()).padStart(2, '0');
                        const hr = String(d.getHours()).padStart(2, '0');
                        const mn = String(d.getMinutes()).padStart(2, '0');
                        return `${yr}-${mo}-${dy} ${hr}:${mn}`;
                    };

                    const start = formatDateString(new Date(event.starts_at));
                    const end = event.ends_at ? formatDateString(new Date(event.ends_at)) : start;

                    return {
                        id: event.id,
                        title: event.title,
                        start,
                        end,
                        description: event.description,
                        location: event.location,
                        _original: event
                    };
                } catch (err) {
                    console.error('Error formatting event:', event, err);
                    return null;
                }
            })
            .filter(Boolean);
    }, [events]);

    const calendarLocale = useMemo(() => {
        if (locale === 'pt') return 'pt-BR';
        if (locale === 'en') return 'en-US';
        if (locale === 'ja') return 'ja-JP';
        return 'ja-JP';
    }, [locale]);

    const calendarApp = useCalendarApp({
        views: [createViewMonthGrid(), createViewMonthAgenda(), createViewWeek(), createViewDay()],
        events: formattedEvents as any,
        plugins: [calendarEventsService],
        defaultView: 'month-grid',
        locale: calendarLocale,
        callbacks: {
            onEventClick: (calendarEvent) => {
                const originalEvent = (calendarEvent as any)._original;
                if (originalEvent) {
                    router.push(originalEvent.slug ? `/eventos/${originalEvent.slug}` : `/eventos/id/${originalEvent.id}`);
                }
            }
        }
    });

    // Update calendar events
    useEffect(() => {
        if (viewMode === 'calendar' && formattedEvents.length > 0) {
            try {
                calendarEventsService.set(formattedEvents as any);
            } catch (error) {
                console.error('Failed to update calendar events:', error);
            }
        }
    }, [formattedEvents, viewMode, calendarEventsService]);

    // Grouping Logic for list view
    const groupedEvents = useMemo(() => {
        const groups: { [key: string]: Event[] } = {};
        (events || []).filter(e => e && e.starts_at).forEach(event => {
            const date = new Date(event.starts_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
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
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-zinc-100">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <CalendarDays className="w-3 h-3" />
                            {t('titleHighlight')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary tracking-tight leading-tight">
                            {t('title')} <span className="text-[#D70F24]">{t('titleHighlight')}</span>
                        </h1>
                        <p className="text-lg text-secondary font-medium max-w-xl">
                            {t('noEventsDescription').split('.')[0]}.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Bar */}
            <section className="sticky top-[52px] z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-[#D70F24] transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-11 pr-6 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary focus:bg-white focus:border-[#D70F24] transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="px-5 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-white focus:border-[#D70F24] transition-all outline-none pr-10 min-w-[140px]"
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="px-5 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-white focus:border-[#D70F24] transition-all outline-none pr-10 min-w-[100px]"
                                >
                                    {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${viewMode === 'calendar'
                                        ? 'bg-white text-[#D70F24] shadow-md border border-zinc-200'
                                        : 'text-muted hover:text-primary'
                                        }`}
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{t('viewCalendar')}</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${viewMode === 'list'
                                        ? 'bg-white text-[#D70F24] shadow-md border border-zinc-200'
                                        : 'text-muted hover:text-primary'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{t('viewList')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-[#D70F24] animate-spin" />
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">{t('loading')}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-8 h-8 text-zinc-300" />
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
                ) : viewMode === 'calendar' ? (
                    <div className="bg-white rounded-[40px] border border-zinc-100 shadow-2xl p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[800px]">
                        <style>{`
                            .sx__calendar-wrapper {
                                --sx-color-primary: #D70F24;
                                --sx-color-on-primary: #fff;
                                --sx-color-background: #fff;
                                --sx-color-on-background: #003768;
                                --sx-color-surface: #f8f9fa;
                                --sx-color-on-surface: rgba(0, 55, 104, 0.72);
                                --sx-color-border: #EAEAEA;
                            }
                            .sx__month-grid-day {
                                min-height: 140px;
                            }
                            .sx__event {
                                background-color: #D70F24 !important;
                                border: none !important;
                                color: white !important;
                                border-radius: 12px !important;
                                padding: 8px 12px !important;
                                font-weight: 700 !important;
                                font-family: var(--font-dm-sans) !important;
                                font-size: 11px !important;
                                box-shadow: 0 4px 12px rgba(215, 15, 36, 0.15);
                            }
                            .sx__month-grid-day--today {
                                background-color: rgba(215, 15, 36, 0.03) !important;
                            }
                            .sx__month-grid-day--today .sx__month-grid-day__header-day-number {
                                color: #D70F24 !important;
                                font-weight: 900 !important;
                                font-size: 1.1rem;
                            }
                        `}</style>
                        <ScheduleXCalendar calendarApp={calendarApp} />
                    </div>
                ) : (
                    <div className="space-y-20">
                        {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => (
                            <section key={monthKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-6 mb-10 overflow-hidden">
                                    <h2 className="text-2xl font-heading font-bold text-primary uppercase tracking-tight whitespace-nowrap">
                                        {formatMonthHeader(monthKey)}
                                    </h2>
                                    <div className="h-px w-full bg-gradient-to-r from-zinc-200 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    {monthEvents.map(event => (
                                        <EventTileCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={loadingMore}
                                    className="px-8 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-primary font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-3 disabled:opacity-50"
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

"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, MapPin, Calendar, Clock, Loader2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAdminEvents } from './hooks/useAdminEvents';
import { useTranslations, useLocale } from 'next-intl';

export default function AdminEventsClient() {
    const t = useTranslations('admin');
    const locale = useLocale();
    const router = useRouter();
    const {
        events,
        loading,
        page,
        setPage,
        totalPages,
        fetchEvents,
        deleteEvent
    } = useAdminEvents();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchEvents(page, searchTerm);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [page, searchTerm, fetchEvents]);

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Events Calendar</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">Organize and manage community gatherings</p>
                </div>
                <Link
                    href="/admin/events/new"
                    className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] group w-fit"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    CREATE EVENT
                </Link>
            </div>

            {/* Filters Area */}
            <div className="bg-surface rounded-3xl border border-app shadow-sm overflow-hidden">
                <div className="p-6 border-b border-app bg-[#0037680a] flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 group-focus-within:text-link transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events or locations..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-app rounded-2xl text-sm text-primary placeholder:text-secondary/30 outline-none focus:border-link/50 focus:ring-4 focus:ring-link/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#00376805] text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app">
                            <tr>
                                <th className="px-6 py-5 whitespace-nowrap">Event Showcase</th>
                                <th className="px-6 py-5 whitespace-nowrap">Schedule</th>
                                <th className="px-6 py-5 whitespace-nowrap">Location</th>
                                <th className="px-6 py-5 whitespace-nowrap text-center">Status</th>
                                <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-link animate-spin" />
                                            <span className="text-secondary/50 font-bold uppercase tracking-widest text-[10px]">Processing calendar...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-secondary/40 italic">
                                        No upcoming events found.
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id} className="hover:bg-[#00376805] group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 flex-shrink-0">
                                                    {event.cover_image_url ? (
                                                        <div className="relative w-full h-full rounded-xl overflow-hidden border border-app shadow-sm">
                                                            <Image
                                                                src={event.cover_image_url}
                                                                alt={event.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="56px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full rounded-xl bg-app flex items-center justify-center text-secondary/20">
                                                            <Calendar className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col max-w-[200px] md:max-w-xs">
                                                    <span className="font-bold text-primary group-hover:text-link transition-colors truncate text-base">
                                                        {event.title}
                                                    </span>
                                                    <span className="text-[10px] text-secondary/40 font-mono tracking-tighter uppercase">
                                                        {event.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary/80">
                                                    <Calendar className="w-3.5 h-3.5 text-link" />
                                                    {formatDate(event.starts_at)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-secondary/50 uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatTime(event.starts_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                                                <MapPin className="w-3.5 h-3.5 text-link" />
                                                <span className="max-w-[150px] truncate">{event.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${event.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                }`}>
                                                {event.status || 'published'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                    className="p-2.5 text-secondary hover:text-link hover:bg-link/10 rounded-xl transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="p-2.5 text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-app flex items-center justify-between bg-[#00376802]">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-app rounded-xl text-xs font-bold text-primary disabled:opacity-30 hover:bg-app transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            PREVIOUS
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === i + 1
                                        ? 'bg-[#5593C3] text-white shadow-lg'
                                        : 'text-secondary hover:bg-app'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-app rounded-xl text-xs font-bold text-primary disabled:opacity-30 hover:bg-app transition-all shadow-sm"
                        >
                            NEXT
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

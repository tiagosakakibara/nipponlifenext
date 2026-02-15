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
                    <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">Events Calendar</h1>
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
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface text-secondary/60 text-[10px] font-bold uppercase tracking-wider border-b border-app">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap font-medium">Event Showcase</th>
                                <th className="px-6 py-4 whitespace-nowrap font-medium">Schedule</th>
                                <th className="px-6 py-4 whitespace-nowrap font-medium">Location</th>
                                <th className="px-6 py-4 whitespace-nowrap font-medium">Status</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-link animate-spin" />
                                            <span className="text-secondary/50 text-xs">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary/40 text-sm">
                                        No events found.
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id} className="group hover:bg-app/30 transition-colors">
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-app">
                                                    {event.cover_image_url ? (
                                                        <Image
                                                            src={event.cover_image_url}
                                                            alt={event.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-secondary/20">
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="font-bold text-primary text-sm line-clamp-1 group-hover:text-link transition-colors">
                                                        {event.title}
                                                    </span>
                                                    <span className="text-[10px] text-secondary/50 uppercase tracking-widest line-clamp-1">
                                                        {event.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex flex-col gap-1 justify-center">
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary/80">
                                                    <Calendar className="w-3.5 h-3.5 text-link" />
                                                    {formatDate(event.starts_at)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-primary/60">
                                                    <Clock className="w-3.5 h-3.5 text-secondary/40" />
                                                    {formatTime(event.starts_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-tight">
                                                <MapPin className="w-3.5 h-3.5 text-link flex-shrink-0" />
                                                <span className="truncate max-w-[180px]">{event.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${event.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                                                }`}>
                                                {event.status || 'published'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 transition-all">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                    className="p-2 text-secondary hover:text-link hover:bg-link/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete"
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

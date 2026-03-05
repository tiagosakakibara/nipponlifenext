"use client";

import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
    Save, ArrowLeft, Globe, ChevronDown, ChevronRight,
    Loader2, Calendar, MapPin, Link as LinkIcon, Send,
    Info, Image as ImageIcon, Clock, ShieldAlert
} from 'lucide-react';
import { eventService } from '@/lib/eventService';
import { Event } from '@/types/event';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslations } from 'next-intl';
import { usePermission } from '../hooks/usePermission';
import { slugify } from '@/utils/slugify';

interface Props {
    id?: string;
    initialData?: Event | null;
}

export default function AdminEventFormClient({ id, initialData }: Props) {
    const router = useRouter();
    const isEditing = !!id;
    const { hasAccess, loading: permissionLoading } = usePermission('events');
    const [loading, setLoading] = useState(false);
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    // Helper to format ISO date to datetime-local input string (YYYY-MM-DDThh:mm)
    const formatDateForInput = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        } catch {
            return '';
        }
    };

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
        defaultValues: initialData ? {
            ...initialData,
            starts_at: formatDateForInput(initialData.starts_at ?? undefined),
            ends_at: formatDateForInput(initialData.ends_at ?? undefined),
            status: initialData.status || 'published'
        } : {
            status: 'published',
            starts_at: '',
            ends_at: ''
        }
    });

    const watchedForm = watch();

    useEffect(() => {
        if (initialData) {
            if (initialData.title_ja || initialData.description_ja) setShowJapanese(true);
            if (initialData.title_en || initialData.description_en) setShowEnglish(true);
        }
    }, [initialData]);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            const payload = {
                ...data,
                slug: data.slug || slugify(data.title || ''),
                starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
                ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
                updated_at: new Date().toISOString()
            };

            if (isEditing && id) {
                await eventService.updateEvent(id, payload);
                toast.success('Evento atualizado com sucesso!');
            } else {
                await eventService.createEvent(payload);
                toast.success('Evento criado com sucesso!');
            }
            router.push('/admin/events');
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Erro ao salvar evento.');
        } finally {
            setLoading(false);
        }
    };

    if (permissionLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-primary">Acesso Negado</h2>
                <p className="text-secondary text-center max-w-md">
                    Você não tem permissão para gerenciar eventos.
                    Entre em contato com um administrador se acredita que isso é um erro.
                </p>
                <Link
                    href="/admin"
                    className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                >
                    Voltar para Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/events')}
                        className="p-3 bg-white border border-app rounded-2xl hover:bg-app transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-secondary group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">
                            {isEditing ? 'Edit Event' : 'New Community Event'}
                        </h1>
                        <p className="text-secondary mt-1 font-medium italic opacity-60">Schedule and detail your gathering</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        form="event-form"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white w-full md:w-auto px-6 md:px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEditing ? 'UPDATE EVENT' : 'PUBLISH EVENT'}
                    </button>
                </div>
            </div>

            <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar - Publication & Meta */}
                <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                    {/* Status */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Send className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">Publication</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">Visibility</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#0037680a] p-1.5 rounded-2xl border border-app">
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'draft')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'draft' ? 'bg-white text-primary shadow-md border border-app/50' : 'text-secondary hover:text-primary'}`}
                                    >
                                        DRAFT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'published')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'published' ? 'bg-[#5593C3] text-white shadow-md' : 'text-secondary hover:text-primary'}`}
                                    >
                                        PUBLISHED
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <ImageIcon className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">Event Cover</h3>
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-3">Main Banner / Promotion</label>
                            <MediaUploader
                                value={watchedForm.cover_image_url}
                                onChange={(url) => setValue('cover_image_url', url)}
                                folderPrefix="events"
                                noContainer
                            />
                        </div>
                    </div>

                    {/* Technical Stats if editing */}
                    {isEditing && (
                        <div className="bg-[#00376805] rounded-3xl border border-app p-6 space-y-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-secondary/40 tracking-[0.2em] uppercase">Unique Identifier</span>
                                <span className="text-[10px] font-mono font-bold text-secondary truncate">{id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-secondary/40 tracking-[0.2em] uppercase">Slug</span>
                                <span className="text-[10px] font-mono font-bold text-link">{watchedForm.slug}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Section */}
                <div className="lg:col-span-8 order-2 lg:order-1 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 text-primary">
                            <Calendar className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">Gathering Highlights</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Event Title *</label>
                                <input
                                    {...register('title', { required: true })}
                                    placeholder="e.g. Community BBQ & Networking"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-xl font-black text-primary placeholder:text-secondary/20 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-link" /> STARTING AT *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('starts_at', { required: true })}
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-accent" /> ENDING AT
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('ends_at')}
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none opacity-80"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Location / Venue</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-link" />
                                        <input
                                            {...register('location')}
                                            placeholder="e.g. Park Yoyogi, Tokyo"
                                            className="w-full pl-11 pr-4 py-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Google Maps URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-link" />
                                        <input
                                            {...register('google_maps_url')}
                                            placeholder="https://goo.gl/maps/..."
                                            className="w-full pl-11 pr-4 py-4 bg-app border border-app rounded-2xl text-xs font-bold text-[#5593C3] focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Info className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">Event Description</h3>
                        </div>
                        <textarea
                            {...register('description')}
                            rows={8}
                            placeholder="Detail what people can expect, what to bring, price if applicable, etc..."
                            className="w-full p-8 bg-app border border-app rounded-3xl text-sm font-medium text-primary focus:bg-white transition-all outline-none resize-none shadow-inner leading-relaxed"
                        />
                    </div>

                    {/* Contact/Action */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <LinkIcon className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">External Contact / Link</h3>
                        </div>
                        <input
                            {...register('contact_url')}
                            placeholder="Website URL, WhatsApp number, or Registration page"
                            className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                        />
                        <p className="text-[9px] text-secondary/30 font-black uppercase tracking-[0.2em] mt-2 italic px-2">This will be used for the RSVP button or contact information.</p>
                    </div>

                    {/* Translations Section */}
                    <div className="bg-surface rounded-3xl border border-app overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-app bg-[#0037680a] flex items-center gap-3">
                            <Globe className="w-5 h-5 text-link" />
                            <h3 className="text-sm font-black text-primary uppercase tracking-tight">Multilingual Information</h3>
                        </div>

                        <div className="border-b border-app">
                            <button
                                type="button"
                                onClick={() => setShowJapanese(!showJapanese)}
                                className="w-full p-5 flex items-center justify-between hover:bg-app/50 transition-colors group"
                            >
                                <span className="flex items-center gap-4 font-bold text-secondary text-sm group-hover:text-primary transition-colors">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-app text-[10px] font-black shadow-sm group-hover:shadow-md transition-shadow">JP</span>
                                    Japanese (日本語)
                                </span>
                                {showJapanese ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showJapanese && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Event Title (JP)</label>
                                            <input {...register('title_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Location (JP)</label>
                                            <input {...register('location_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Description (JP)</label>
                                            <textarea {...register('description_ja')} rows={4} className="w-full p-4 bg-white border border-app rounded-3xl text-sm shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setShowEnglish(!showEnglish)}
                                className="w-full p-5 flex items-center justify-between hover:bg-app/50 transition-colors group"
                            >
                                <span className="flex items-center gap-4 font-bold text-secondary text-sm group-hover:text-primary transition-colors">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-app text-[10px] font-black shadow-sm group-hover:shadow-md transition-shadow">EN</span>
                                    English
                                </span>
                                {showEnglish ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showEnglish && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Event Title (EN)</label>
                                            <input {...register('title_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Location (EN)</label>
                                            <input {...register('location_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Description (EN)</label>
                                            <textarea {...register('description_en')} rows={4} className="w-full p-4 bg-white border border-app rounded-3xl text-sm shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

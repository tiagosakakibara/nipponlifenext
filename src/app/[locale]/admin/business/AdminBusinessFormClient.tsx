"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
    Save, ArrowLeft, Upload, X, Plus, FileText, Globe,
    ChevronDown, ChevronRight, Loader2, Star, MapPin, Phone,
    Mail, Instagram, Send, Info, Image as ImageIcon, ShieldAlert
} from 'lucide-react';
import { businessService } from '@/lib/businessService';
import { Business, BusinessFormData } from '@/types/business';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslations } from 'next-intl';
import { usePermission } from '@/app/[locale]/admin/hooks/usePermission';

interface Props {
    id?: string;
    initialData?: Business | null;
}

export default function AdminBusinessFormClient({ id, initialData }: Props) {
    const t = useTranslations('admin');
    const bizT = useTranslations('business');
    const router = useRouter();
    const { hasAccess, loading: permissionLoading } = usePermission('businesses');
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusinessFormData>({
        defaultValues: initialData || {
            country: 'Japan',
            status: 'draft',
            featured: false,
            gallery_images: [],
            presentation_url: null,
            opening_hours: {},
            languages_supported: ['pt'],
            price_range: '$$'
        }
    });

    const watchedForm = watch();

    useEffect(() => {
        if (initialData) {
            if (initialData.business_name_ja || initialData.description_short_ja) setShowJapanese(true);
            if (initialData.business_name_en || initialData.description_short_en) setShowEnglish(true);
        }
    }, [initialData]);

    if (permissionLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                    Você não tem permissão para gerenciar empresas.
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

    const onSubmit = async (data: BusinessFormData) => {
        try {
            setLoading(true);
            if (isEditing && id) {
                await businessService.updateBusiness(id, data);
                toast.success('Empresa atualizada com sucesso!');
            } else {
                await businessService.createBusiness(data);
                toast.success('Empresa criada com sucesso!');
            }
            router.push('/admin/business');
        } catch (error) {
            console.error('Error saving business:', error);
            toast.error('Erro ao salvar empresa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/business')}
                        className="p-3 bg-white border border-app rounded-2xl hover:bg-app transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-secondary group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">
                            {isEditing ? t('editBusiness') : t('newBusiness')}
                        </h1>
                        <p className="text-secondary mt-1 font-medium italic opacity-60">{t('businessListSubtitle')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        form="business-form"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white w-full md:w-auto px-6 md:px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {t('save')}
                    </button>
                </div>
            </div>

            <form id="business-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Right/Sidebar - Status & Media */}
                <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                    {/* Status & Featured */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Send className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">{t('displaySettings')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">{t('status')}</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#0037680a] p-1.5 rounded-2xl border border-app">
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'draft')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'draft' ? 'bg-white text-primary shadow-md border border-app/50' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('draft_short')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'published')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'published' ? 'bg-[#5593C3] text-white shadow-md' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('published_short')}
                                    </button>
                                </div>
                            </div>

                            <div
                                onClick={() => setValue('featured', !watchedForm.featured)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${watchedForm.featured ? 'bg-amber-500/10 border-amber-500/30' : 'bg-app border-app'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${watchedForm.featured ? 'bg-amber-500 text-white' : 'bg-white text-secondary'}`}>
                                        <Star className={`w-4 h-4 ${watchedForm.featured ? 'fill-current' : ''}`} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase ${watchedForm.featured ? 'text-amber-700' : 'text-secondary'}`}>{t('featuredBusiness')}</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-all border ${watchedForm.featured ? 'bg-amber-500 border-amber-600' : 'bg-white border-app'}`}>
                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm ${watchedForm.featured ? 'left-[22px]' : 'left-0.5'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <ImageIcon className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">{t('branding')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-3">{t('logo')} (1:1)</label>
                                <MediaUploader
                                    value={watchedForm.logo_url}
                                    onChange={(url) => setValue('logo_url', url)}
                                    folderPrefix="businesses"
                                    noContainer
                                />
                            </div>

                            <div className="pt-6 border-t border-app">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-3">{t('coverImage')} (16:9)</label>
                                <MediaUploader
                                    value={watchedForm.cover_image_url}
                                    onChange={(url) => setValue('cover_image_url', url)}
                                    folderPrefix="businesses"
                                    noContainer
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left/Main - Content & Info */}
                <div className="lg:col-span-8 order-2 lg:order-1 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Info className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">{t('basicInfo')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('businessName')} *</label>
                                <input
                                    {...register('business_name', { required: true })}
                                    placeholder="ex: Nippon Sushi Restobar"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-primary font-bold focus:bg-white focus:ring-4 focus:ring-link/5 transition-all outline-none"
                                />
                                {errors.business_name && <p className="text-accent text-[10px] font-bold mt-1 uppercase">{t('businessNameRequired')}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('category')} *</label>
                                <select
                                    {...register('category', { required: true })}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-primary font-bold focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="">{t('selectCategory')}</option>
                                    <option value="Gastronomia">{bizT('categories.Gastronomia')}</option>
                                    <option value="Saúde & Bem-estar">{bizT('categories.Saúde & Bem-estar')}</option>
                                    <option value="Serviços">{bizT('categories.Serviços')}</option>
                                    <option value="Imobiliárias">{bizT('categories.Imobiliárias')}</option>
                                    <option value="Jurídico e Vistos">{bizT('categories.Jurídico e Vistos')}</option>
                                    <option value="Mudanças e Logística">{bizT('categories.Mudanças e Logística')}</option>
                                    <option value="Tecnologia">{bizT('categories.Tecnologia')}</option>
                                    <option value="Outros">{bizT('categories.Outros')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('priceRange')}</label>
                                <select
                                    {...register('price_range')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-primary font-bold focus:bg-white transition-all outline-none"
                                >
                                    <option value="$">$ (Economy)</option>
                                    <option value="$$">$$ (Standard)</option>
                                    <option value="$$$">$$$ (Premium)</option>
                                    <option value="$$$$">$$$$ (Luxury)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('shortDescription')} * (Max 160 chars)</label>
                                <input
                                    {...register('description_short', { required: true, maxLength: 160 })}
                                    placeholder={t('shortDescriptionPlaceholder')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-primary font-medium focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('fullDescription')}</label>
                                <textarea
                                    {...register('description_long')}
                                    rows={6}
                                    placeholder={t('shortDescriptionPlaceholder')}
                                    className="w-full p-6 bg-app border border-app rounded-3xl text-primary font-medium focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Location */}
                        <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <MapPin className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">{t('location')}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('address')} *</label>
                                        <input {...register('address_line1', { required: true })} className="w-full p-3.5 bg-app border border-app rounded-xl text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('city')} *</label>
                                        <input {...register('city', { required: true })} className="w-full p-3.5 bg-app border border-app rounded-xl text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('prefecture')} *</label>
                                        <input {...register('prefecture', { required: true })} className="w-full p-3.5 bg-app border border-app rounded-xl text-xs font-bold" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('googleMapsUrl')}</label>
                                        <input {...register('google_maps_url')} placeholder="https://..." className="w-full p-3.5 bg-app border border-app rounded-xl text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <Phone className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">{t('contact')}</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('phone')}</label>
                                    <input {...register('phone')} className="w-full p-3.5 bg-app border border-app rounded-xl text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('email')}</label>
                                    <input {...register('email')} className="w-full p-3.5 bg-app border border-app rounded-xl text-xs" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('instagram')} @</label>
                                    <input {...register('instagram_url')} placeholder="nipponlife" className="w-full p-3.5 bg-app border border-app rounded-xl text-xs" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('website')}</label>
                                    <input {...register('website_url')} placeholder="https://..." className="w-full p-3.5 bg-app border border-app rounded-xl text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gallery & Presentation */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Plus className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">{t('gallery')} & {t('media')}</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-4">{t('gallery')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {(watchedForm.gallery_images || []).map((url, idx) => (
                                        <div key={idx} className="aspect-square relative group">
                                            <Image
                                                src={url}
                                                alt={`Gallery ${idx}`}
                                                fill
                                                className="object-cover rounded-2xl border border-app shadow-sm group-hover:shadow-xl transition-all"
                                                sizes="(max-width: 768px) 50vw, 20vw"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const gallery = [...(watchedForm.gallery_images || [])];
                                                    gallery.splice(idx, 1);
                                                    setValue('gallery_images', gallery);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95 z-10"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-app/60 bg-app/40 rounded-2xl hover:bg-app cursor-pointer transition-all group overflow-hidden">
                                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5 text-link" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-secondary/50 mt-3">{t('addImage')}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const url = await businessService.uploadFile(file, 'gallery');
                                                    setValue('gallery_images', [...(watchedForm.gallery_images || []), url]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-app">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-4">{t('presentation')}</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    {watchedForm.presentation_url ? (
                                        <div className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 shadow-inner">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <FileText className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-emerald-900">{t('pdfFile')}</span>
                                                <a href={watchedForm.presentation_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[#5593C3] hover:underline">
                                                    {t('download')}
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setValue('presentation_url', null)}
                                                className="p-2 text-secondary/30 hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-secondary/30 bg-app p-4 px-6 rounded-2xl border border-app italic">
                                            {t('pdfNotUploaded')}
                                        </div>
                                    )}

                                    <label className="cursor-pointer bg-[#5593C3]/10 text-[#5593C3] hover:bg-[#5593C3] hover:text-white px-8 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 group border border-[#5593C3]/20 hover:shadow-xl">
                                        <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                        {t('uploadPresentation')}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const url = await businessService.uploadFile(file, 'documents');
                                                    setValue('presentation_url', url);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Translations Toggle */}
                    <div className="bg-surface rounded-3xl border border-app overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-app bg-[#0037680a] flex items-center gap-3">
                            <Globe className="w-5 h-5 text-link" />
                            <h3 className="text-sm font-black text-primary uppercase tracking-tight">{t('translationsTitle')}</h3>
                        </div>

                        <div className="border-b border-app">
                            <button
                                type="button"
                                onClick={() => setShowJapanese(!showJapanese)}
                                className="w-full p-5 flex items-center justify-between hover:bg-app/50 transition-colors group"
                            >
                                <span className="flex items-center gap-4 font-bold text-secondary text-sm group-hover:text-primary transition-colors">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-app text-[10px] font-black shadow-sm group-hover:shadow-md transition-shadow">JP</span>
                                    {t('japaneseLanguage')}
                                </span>
                                {showJapanese ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showJapanese && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('businessName')} (JP)</label>
                                            <input {...register('business_name_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('shortDescription')} (JP)</label>
                                            <input {...register('description_short_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-xs shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('fullDescription')} (JP)</label>
                                            <textarea {...register('description_long_ja')} rows={4} className="w-full p-4 bg-white border border-app rounded-3xl text-sm shadow-inner" />
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
                                    {t('englishLanguage')}
                                </span>
                                {showEnglish ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showEnglish && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('businessName')} (EN)</label>
                                            <input {...register('business_name_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('shortDescription')} (EN)</label>
                                            <input {...register('description_short_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-xs shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('fullDescription')} (EN)</label>
                                            <textarea {...register('description_long_en')} rows={4} className="w-full p-4 bg-white border border-app rounded-3xl text-sm shadow-inner" />
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


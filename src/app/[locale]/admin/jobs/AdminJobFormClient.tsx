"use client";

import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
    Save, ArrowLeft, Plus, X, Globe, ChevronDown, ChevronRight,
    Loader2, Star, Briefcase, Building2, MapPin, DollarSign,
    Tag, CheckCircle2, Heart, Gift, Clock, Bus, Shield, Utensils,
    Calendar, Send, Info, Image as ImageIcon, Laptop, ShieldAlert, Mail, Phone
} from 'lucide-react';
import { jobsService } from '@/lib/jobsService';
import { Job, JobFormData } from '@/types/job';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslations } from 'next-intl';
import { usePermission } from '../hooks/usePermission';
import { slugify, generateSlugSuffix } from '@/utils/slugify';

const BENEFIT_ICONS = [
    { value: 'shield', icon: Shield, i18nKey: 'insurance' },
    { value: 'bus', icon: Bus, i18nKey: 'transportation' },
    { value: 'home', icon: Laptop, i18nKey: 'home' },
    { value: 'gift', icon: Gift, i18nKey: 'gift' },
    { value: 'utensils', icon: Utensils, i18nKey: 'utensils' },
    { value: 'clock', icon: Clock, i18nKey: 'clock' },
    { value: 'calendar', icon: Calendar, i18nKey: 'calendar' },
    { value: 'heart', icon: Heart, i18nKey: 'heart' },
];

interface Props {
    id?: string;
    initialData?: Job | null;
}

export default function AdminJobFormClient({ id, initialData }: Props) {
    const router = useRouter();
    const t = useTranslations('admin.jobs.form');
    const tb = useTranslations('admin.jobs.benefits');
    const isEditing = !!id;
    const { hasAccess, loading: permissionLoading } = usePermission('jobs');
    const [loading, setLoading] = useState(false);
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    // Tag input state
    const [tagInput, setTagInput] = useState('');

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<any>({
        defaultValues: initialData ? {
            ...initialData.db_fields,
            tags: initialData.tags || [],
            requirements: initialData.requirements || [],
            benefits: initialData.benefits || [],
            requirements_ja: initialData.db_fields?.requirements_ja || [],
            requirements_en: initialData.db_fields?.requirements_en || [],
            benefits_ja: initialData.db_fields?.benefits_ja || [],
            benefits_en: initialData.db_fields?.benefits_en || [],
            status: initialData.status || 'draft',
            featured: initialData.featured || false,
            pay_unit: initialData.db_fields?.pay_unit || 'hour',
            application_mode: initialData.db_fields?.application_mode || 'internal_form',
            contact: initialData.db_fields?.contact || '',
            contact_phone1: initialData.db_fields?.contact_phone1 || '',
            contact_phone2: initialData.db_fields?.contact_phone2 || '',
            expires_at: initialData.expires_at || '',
            position_order: initialData.position_order || 0
        } : {
            status: 'draft',
            featured: false,
            job_type: 'Full-time',
            pay_unit: 'hour',
            application_mode: 'internal_form',
            contact: '',
            contact_phone1: '',
            contact_phone2: '',
            tags: [],
            requirements: [],
            benefits: [],
            requirements_ja: [],
            requirements_en: [],
            benefits_ja: [],
            benefits_en: []
        }
    });

    const watchedForm = watch();

    useEffect(() => {
        if (initialData) {
            if (initialData.title_ja || initialData.description_ja?.length) setShowJapanese(true);
            if (initialData.title_en || initialData.description_en?.length) setShowEnglish(true);
        }
    }, [initialData]);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);

            if (!isEditing && !data.slug) {
                data.slug = `${slugify(data.title || 'vaga')}-${generateSlugSuffix()}`;
            }

            // Convert arrays to strings if necessary for some DB fields or handle in service
            if (isEditing && id) {
                await jobsService.updateJob(id, data);
                toast.success('Vaga atualizada com sucesso!');
            } else {
                await jobsService.createJob(data);
                toast.success('Vaga criada com sucesso!');
            }
            router.push({ pathname: '/admin/jobs' });
        } catch (error) {
            console.error('Error saving job:', error);
            toast.error('Erro ao salvar vaga.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !watchedForm.tags.includes(val)) {
                setValue('tags', [...watchedForm.tags, val]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tag: string) => {
        setValue('tags', watchedForm.tags.filter((t: string) => t !== tag));
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
                    Você não tem permissão para gerenciar vagas de emprego.
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
                    <Link
                        href="/admin/jobs"
                        className="p-3 bg-white border border-app rounded-2xl hover:bg-app transition-all shadow-sm group inline-flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-secondary group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">
                            {isEditing ? t('editPosition') : t('newCareerPosting')}
                        </h1>
                        <p className="text-secondary mt-1 font-medium italic opacity-60">{t('defineOpportunity')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        form="job-form"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white w-full md:w-auto px-6 md:px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEditing ? t('updatePosting') : t('createOpportunity')}
                    </button>
                </div>
            </div>

            <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar - Publication & Meta */}
                <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                    {/* Status & Featured */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Send className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">{t('publication')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">{t('listingStatus')}</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#0037680a] p-1.5 rounded-2xl border border-app">
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'draft')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'draft' ? 'bg-white text-primary shadow-md border border-app/50' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('draft')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'published')}
                                        className={`py-2 text-[10px] font-black rounded-xl transition-all ${watchedForm.status === 'published' ? 'bg-[#5593C3] text-white shadow-md' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('published')}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">{t('expiresAt')}</label>
                                    <input
                                        type="date"
                                        {...register('expires_at')}
                                        className="w-full p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">{t('sortOrder')}</label>
                                    <input
                                        type="number"
                                        {...register('position_order')}
                                        placeholder="0"
                                        className="w-full p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none"
                                    />
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
                                    <span className={`text-xs font-bold uppercase ${watchedForm.featured ? 'text-amber-700' : 'text-secondary'}`}>{t('highlightStar')}</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-all border ${watchedForm.featured ? 'bg-amber-500 border-amber-600' : 'bg-white border-app'}`}>
                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm ${watchedForm.featured ? 'left-[22px]' : 'left-0.5'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding/Logo */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <ImageIcon className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">{t('companyAssets')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-3">{t('companyLogoBanner')}</label>
                                <MediaUploader
                                    value={watchedForm.cover_image_url}
                                    onChange={(url) => setValue('cover_image_url', url)}
                                    folderPrefix="jobs"
                                    noContainer
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-surface rounded-3xl border border-app p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Tag className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">{t('labelsSeo')}</h3>
                        </div>

                        <div className="space-y-3">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder={t('addSkillTags')}
                                className="w-full p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {(watchedForm.tags || []).map((tag: string) => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0037680a] border border-app rounded-lg text-[9px] font-black uppercase tracking-widest text-[#5593C3] group hover:border-[#5593C3]/30 transition-all">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Section */}
                <div className="lg:col-span-8 order-2 lg:order-1 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 text-primary">
                            <Briefcase className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">{t('jobDefinition')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('employmentTitle')}</label>
                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="e.g. Senior Backend Developer"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-xl font-black text-primary placeholder:text-secondary/20 focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('companyEntity')}</label>
                                    <input
                                        {...register('company_name', { required: true })}
                                        placeholder="e.g. TechCorp Japan"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('employmentType')}</label>
                                    <select
                                        {...register('job_type')}
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="Full-time">Tempo integral (Full-time)</option>
                                        <option value="Part-time">Meio período (Part-time)</option>
                                        <option value="Contract">Contrato (Contract)</option>
                                        <option value="Temporary">Temporário (Temporary)</option>
                                        <option value="Alternado">Alternado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('prefecture')}</label>
                                    <input
                                        {...register('prefecture')}
                                        placeholder="e.g. Aichi"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('city')}</label>
                                    <input
                                        {...register('city')}
                                        placeholder="e.g. Toyota-shi"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Application Contact */}
                        <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 text-primary">
                                <Mail className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">Contato para Candidaturas</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Email Principal para Recebimento</label>
                                    <input
                                        {...register('contact')}
                                        placeholder="ex: contato@empresa.com"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                    <p className="text-[10px] font-bold text-secondary/50 mt-2">
                                        Este email receberá as notificações de novas candidaturas.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">
                                            <Phone className="w-3 h-3" /> Telefone Contato 1
                                        </label>
                                        <input
                                            {...register('contact_phone1')}
                                            placeholder="ex: 090-1234-5678"
                                            className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">
                                            <Phone className="w-3 h-3" /> Telefone Contato 2 (Opcional)
                                        </label>
                                        <input
                                            {...register('contact_phone2')}
                                            placeholder="ex: 080-9876-5432"
                                            className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compensation */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <DollarSign className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">{t('compensation')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('publicSalaryLabel')}</label>
                                <input
                                    {...register('salary_text')}
                                    placeholder="e.g. ¥1,200 ~ ¥1,500/hr"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-[#5593C3] focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('rateUnit')}</label>
                                <select
                                    {...register('pay_unit')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="hour">{t('perHour')}</option>
                                    <option value="day">{t('perDay')}</option>
                                    <option value="month">{t('perMonth')}</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">{t('bonusExtras')}</label>
                                <textarea
                                    {...register('bonus_text')}
                                    rows={2}
                                    placeholder={t('bonusExtrasPlaceholder')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-medium text-primary focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements & Benefits (Dynamic Lists) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Requirements */}
                        <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <CheckCircle2 className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">{t('requirements')}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {(watchedForm.requirements || []).map((req: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#0037680a] border border-app rounded-2xl group animate-fade-in">
                                            <span className="w-1.5 h-1.5 rounded-full bg-link/40 shrink-0" />
                                            <span className="flex-1 text-xs font-bold text-primary line-clamp-2">{req}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const list = [...watchedForm.requirements];
                                                    list.splice(idx, 1);
                                                    setValue('requirements', list);
                                                }}
                                                className="p-1.5 text-secondary/30 hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        id="req-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const val = input.value.trim();
                                                if (val) {
                                                    setValue('requirements', [...(watchedForm.requirements || []), val]);
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                        placeholder={t('addRequirement')}
                                        className="w-full p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('req-input') as HTMLInputElement;
                                            const val = input.value.trim();
                                            if (val) {
                                                setValue('requirements', [...(watchedForm.requirements || []), val]);
                                                input.value = '';
                                            }
                                        }}
                                        className="p-3 bg-white border border-app rounded-xl text-secondary hover:text-link transition-colors shadow-sm"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <Gift className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">{t('perksBenefits')}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {(watchedForm.benefits || []).map((ben: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#0037680a] border border-app rounded-2xl group animate-fade-in">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-app shadow-sm text-link">
                                                {BENEFIT_ICONS.find(i => i.value === ben.icon)?.icon ? (
                                                    (() => {
                                                        const IconComponent = BENEFIT_ICONS.find(i => i.value === ben.icon)?.icon!;
                                                        return <IconComponent className="w-4 h-4" />;
                                                    })()
                                                ) : <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <span className="flex-1 text-xs font-bold text-primary line-clamp-1">{ben.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const list = [...watchedForm.benefits];
                                                    list.splice(idx, 1);
                                                    setValue('benefits', list);
                                                }}
                                                className="p-1.5 text-secondary/30 hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <select id="ben-icon" className="p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none appearance-none">
                                            {BENEFIT_ICONS.map(i => <option key={i.value} value={i.value}>{tb(i.i18nKey)}</option>)}
                                        </select>
                                        <input
                                            id="ben-label"
                                            placeholder={t('benefitLabel')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const labelInput = document.getElementById('ben-label') as HTMLInputElement;
                                                    const iconInput = document.getElementById('ben-icon') as HTMLSelectElement;
                                                    if (labelInput.value.trim()) {
                                                        setValue('benefits', [...(watchedForm.benefits || []), { icon: iconInput.value, label: labelInput.value.trim() }]);
                                                        labelInput.value = '';
                                                    }
                                                }
                                            }}
                                            className="w-full p-3 bg-app border border-app rounded-xl text-xs font-bold focus:bg-white transition-all outline-none shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const labelInput = document.getElementById('ben-label') as HTMLInputElement;
                                                const iconInput = document.getElementById('ben-icon') as HTMLSelectElement;
                                                if (labelInput.value.trim()) {
                                                    setValue('benefits', [...(watchedForm.benefits || []), { icon: iconInput.value, label: labelInput.value.trim() }]);
                                                    labelInput.value = '';
                                                }
                                            }}
                                            className="p-3 bg-white border border-app rounded-xl text-secondary hover:text-link transition-colors shadow-sm"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Description */}
                    <div className="bg-surface rounded-3xl border border-app p-4 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Info className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">{t('narrativeBio')}</h3>
                        </div>
                        <textarea
                            {...register('description')}
                            rows={8}
                            placeholder={t('narrativePlaceholder')}
                            className="w-full p-8 bg-app border border-app rounded-3xl text-sm font-medium text-primary focus:bg-white transition-all outline-none resize-none shadow-inner leading-relaxed"
                        />
                    </div>

                    {/* Translations Section */}
                    <div className="bg-surface rounded-3xl border border-app overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-app bg-[#0037680a] flex items-center gap-3">
                            <Globe className="w-5 h-5 text-link" />
                            <h3 className="text-sm font-black text-primary uppercase tracking-tight">{t('multilingualInfo')}</h3>
                        </div>

                        <div className="border-b border-app">
                            <button
                                type="button"
                                onClick={() => setShowJapanese(!showJapanese)}
                                className="w-full p-5 flex items-center justify-between hover:bg-app/50 transition-colors group"
                            >
                                <span className="flex items-center gap-4 font-bold text-secondary text-sm group-hover:text-primary transition-colors">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-app text-[10px] font-black shadow-sm group-hover:shadow-md transition-shadow">JP</span>
                                    {t('japanese')}
                                </span>
                                {showJapanese ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showJapanese && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('employmentTitleJp')}</label>
                                            <input {...register('title_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('narrativeJp')}</label>
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
                                    {t('english')}
                                </span>
                                {showEnglish ? <ChevronDown className="w-4 h-4 text-link" /> : <ChevronRight className="w-4 h-4 text-secondary/40" />}
                            </button>
                            {showEnglish && (
                                <div className="p-4 md:p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('employmentTitleEn')}</label>
                                            <input {...register('title_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">{t('narrativeEn')}</label>
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

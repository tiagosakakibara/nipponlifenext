"use client";

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
    Save, ArrowLeft, Plus, X, Globe, ChevronDown, ChevronRight,
    Loader2, Star, Briefcase, Building2, MapPin, DollarSign,
    Tag, CheckCircle2, Heart, Gift, Clock, Bus, Shield, Utensils,
    Calendar, Send, Info, Image as ImageIcon, Laptop
} from 'lucide-react';
import { jobsService } from '@/lib/jobsService';
import { Job, JobFormData } from '@/types/job';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslations } from 'next-intl';

const BENEFIT_ICONS = [
    { value: 'shield', icon: Shield, label: 'Insurance' },
    { value: 'bus', icon: Bus, label: 'Transportation' },
    { value: 'home', icon: Laptop, label: 'Housing' }, // No Home icon in my imports above, using Laptop for now or add Home
    { value: 'gift', icon: Gift, label: 'Bonus' },
    { value: 'utensils', icon: Utensils, label: 'Meals' },
    { value: 'clock', icon: Clock, label: 'Schedule' },
    { value: 'calendar', icon: Calendar, label: 'Vacation' },
    { value: 'heart', icon: Heart, label: 'Health' },
];

interface Props {
    id?: string;
    initialData?: Job | null;
}

export default function AdminJobFormClient({ id, initialData }: Props) {
    const router = useRouter();
    const isEditing = !!id;
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
            application_mode: initialData.db_fields?.application_mode || 'internal_form'
        } : {
            status: 'draft',
            featured: false,
            job_type: 'Full-time',
            pay_unit: 'hour',
            application_mode: 'internal_form',
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
            // Convert arrays to strings if necessary for some DB fields or handle in service
            if (isEditing && id) {
                await jobsService.updateJob(id, data);
                toast.success('Vaga atualizada com sucesso!');
            } else {
                await jobsService.createJob(data);
                toast.success('Vaga criada com sucesso!');
            }
            router.push('/admin/jobs');
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

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/jobs')}
                        className="p-3 bg-white border border-app rounded-2xl hover:bg-app transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-secondary group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">
                            {isEditing ? 'Edit Position' : 'New Career Posting'}
                        </h1>
                        <p className="text-secondary mt-1 font-medium italic opacity-60">Define the opportunity and company requirements</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        form="job-form"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEditing ? 'UPDATE POSTING' : 'CREATE OPPORTUNITY'}
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
                            <h3 className="font-bold text-sm tracking-tight uppercase">Publication</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest">Listing Status</label>
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

                            <div
                                onClick={() => setValue('featured', !watchedForm.featured)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${watchedForm.featured ? 'bg-amber-500/10 border-amber-500/30' : 'bg-app border-app'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${watchedForm.featured ? 'bg-amber-500 text-white' : 'bg-white text-secondary'}`}>
                                        <Star className={`w-4 h-4 ${watchedForm.featured ? 'fill-current' : ''}`} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase ${watchedForm.featured ? 'text-amber-700' : 'text-secondary'}`}>Highlight Star Opportunity</span>
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
                            <h3 className="font-bold text-sm tracking-tight uppercase">Company Assets</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-3">Company Logo / Job Banner</label>
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
                            <h3 className="font-bold text-sm tracking-tight uppercase">Labels & SEO</h3>
                        </div>

                        <div className="space-y-3">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add skill tags... (Press Enter)"
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
                    <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 text-primary">
                            <Briefcase className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">Job Definition</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Employment Title *</label>
                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="e.g. Senior Backend Developer"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-xl font-black text-primary placeholder:text-secondary/20 focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Company Entity *</label>
                                    <input
                                        {...register('company_name', { required: true })}
                                        placeholder="e.g. TechCorp Japan"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Employment Type</label>
                                    <select
                                        {...register('job_type')}
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Temporary">Temporary</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Prefecture (Japan)</label>
                                    <input
                                        {...register('prefecture')}
                                        placeholder="e.g. Aichi"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">City</label>
                                    <input
                                        {...register('city')}
                                        placeholder="e.g. Toyota-shi"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compensation */}
                    <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <DollarSign className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">Compensation & Salary</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Public Salary Label</label>
                                <input
                                    {...register('salary_text')}
                                    placeholder="e.g. ¥1,200 ~ ¥1,500/hr"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-[#5593C3] focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Rate Unit</label>
                                <select
                                    {...register('pay_unit')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="hour">Per Hour</option>
                                    <option value="day">Per Day</option>
                                    <option value="month">Per Month</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5">Bonus & Extras Text</label>
                                <textarea
                                    {...register('bonus_text')}
                                    rows={2}
                                    placeholder="Commuting allowance, yearly bonuses, housing support..."
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-medium text-primary focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements & Benefits (Dynamic Lists) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Requirements */}
                        <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <CheckCircle2 className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">Requirements</h3>
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
                                        placeholder="Add requirement..."
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
                        <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <Gift className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight">Perks & Benefits</h3>
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
                                            {BENEFIT_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                        </select>
                                        <input
                                            id="ben-label"
                                            placeholder="Label (e.g. Free Meals)"
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
                    <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Info className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">Narrative & Bio</h3>
                        </div>
                        <textarea
                            {...register('description')}
                            rows={8}
                            placeholder="Full detailed description of the job, daily tasks, and about the company..."
                            className="w-full p-8 bg-app border border-app rounded-3xl text-sm font-medium text-primary focus:bg-white transition-all outline-none resize-none shadow-inner leading-relaxed"
                        />
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
                                <div className="p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Employment Title (JP)</label>
                                            <input {...register('title_ja')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Narrative (JP)</label>
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
                                <div className="p-8 pt-2 space-y-6 bg-app/20 animate-fade-in">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Employment Title (EN)</label>
                                            <input {...register('title_en')} className="w-full p-4 bg-white border border-app rounded-2xl text-primary font-bold shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-secondary/60 uppercase block tracking-widest mb-1.5">Narrative (EN)</label>
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

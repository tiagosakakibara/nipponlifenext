"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Save, Send, X, Upload, Loader2,
    ArrowLeft, Globe, ChevronDown, CheckCircle2,
    Layout, Image as ImageIcon, Calendar, Tag,
    ChevronRight, Info, AlertTriangle, PenTool
} from 'lucide-react';
import { communityService } from '@/lib/communityService';
import { storageService } from '@/lib/storageService';
import { MediaUploader } from '@/components/MediaUploader';
import { toast } from 'react-hot-toast';
import { useRouter } from '@/i18n/routing';

interface Props {
    id?: string;
    initialData?: any;
}

export default function AdminCommunityPostFormClient({ id, initialData }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);


    const [coverImage, setCoverImage] = useState<string | null>(initialData?.cover_image_url || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: initialData || {
            status: 'draft',
            category_id: '',
            is_public: true
        }
    });

    // Keep image state in sync if navigating via turbo soft-navigation
    useEffect(() => {
        if (initialData?.cover_image_url) {
            setCoverImage(initialData.cover_image_url);
        }
    }, [initialData?.cover_image_url]);

    const status = watch('status');

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await communityService.getCategories();
                setCategories(cats);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCats();
    }, []);

    const onSubmit = async (formData: any) => {
        setLoading(true);
        try {
            // Filter only valid database columns to avoid Supabase errors with joined fields
            const payload: any = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content: formData.content,
                status: formData.status,
                category_id: formData.category_id === '' ? null : formData.category_id,
                cover_image_url: coverImage,
                title_ja: formData.title_ja,
                content_ja: formData.content_ja,
                title_en: formData.title_en,
                content_en: formData.content_en,
                excerpt_ja: formData.excerpt_ja,
                excerpt_en: formData.excerpt_en,
                updated_at: new Date().toISOString()
            };

            console.log('🚀 Saving Community Post with payload:', payload);

            if (id) {
                await communityService.updatePost(id, payload);
                toast.success('Post atualizado');
            } else {
                await communityService.createPost(payload);
                toast.success('Post criado');
            }
            window.location.assign('/pt/admin/comunidade/posts');
        } catch (error: any) {
            console.error('❌ Error saving post:', error);
            const message = error.message || error.details || 'Erro desconhecido';
            toast.error(`Erro ao salvar: ${message}`);
        } finally {
            setLoading(false);
        }
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-secondary mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-link">Editor</span>
                    </div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">
                        {id ? 'Refine Post' : 'Craft Experience'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.assign('/pt/admin/comunidade/posts')}
                        className="bg-surface border border-app text-secondary px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-app transition-all"
                    >
                        DISCARD
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex items-center gap-2 bg-[#D70F24] hover:bg-[#b50d1f] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {id ? 'UPDATE FEED' : 'LAUNCH POST'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-surface rounded-[40px] border border-app p-8 shadow-xl space-y-8">
                        <div className="flex items-center gap-3">
                            <PenTool className="w-6 h-6 text-accent" />
                            <h3 className="font-black text-xl tracking-tight text-primary">Narrative Core</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">Engagement Title</label>
                                <input
                                    {...register('title', { required: true })}
                                    className="w-full p-5 bg-app border border-app rounded-2xl text-2xl font-black text-primary focus:bg-surface focus:border-link transition-all outline-none placeholder:text-muted"
                                    placeholder="The impact of cultural exchange..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">Explanatory Snippet</label>
                                <textarea
                                    {...register('excerpt')}
                                    rows={3}
                                    className="w-full p-5 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-surface focus:border-link transition-all outline-none resize-none placeholder:text-muted"
                                    placeholder="Briefly describe the essence of this discussion..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">Full Discourse</label>
                                <textarea
                                    {...register('content', { required: true })}
                                    rows={15}
                                    className="w-full p-5 bg-app border border-app rounded-2xl text-sm font-medium text-primary focus:bg-surface focus:border-link transition-all outline-none placeholder:text-muted"
                                    placeholder="Start writing your story here..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Multilingual Support */}
                    <section className="space-y-4">
                        <div
                            onClick={() => setShowJapanese(!showJapanese)}
                            className="bg-surface p-6 rounded-3xl border border-app shadow-xl flex items-center justify-between cursor-pointer hover:border-accent transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">JA</div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-primary">Japanese Localization</h4>
                                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">Translate content for the Nikkei community</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${showJapanese ? 'rotate-180' : ''}`} />
                        </div>

                        {showJapanese && (
                            <div className="bg-app/50 p-8 rounded-[32px] border border-accent/20 border-dashed space-y-6 animate-slide-down">
                                <input
                                    {...register('title_ja')}
                                    className="w-full p-4 bg-surface border border-accent/20 rounded-2xl text-lg font-black text-primary outline-none placeholder:text-muted focus:border-accent"
                                    placeholder="日本語のタイトル"
                                />
                                <textarea
                                    {...register('content_ja')}
                                    rows={6}
                                    className="w-full p-4 bg-surface border border-accent/20 rounded-2xl text-sm font-medium text-primary outline-none placeholder:text-muted focus:border-accent"
                                    placeholder="日本語の内容..."
                                />
                            </div>
                        )}

                        <div
                            onClick={() => setShowEnglish(!showEnglish)}
                            className="bg-surface p-6 rounded-3xl border border-app shadow-xl flex items-center justify-between cursor-pointer hover:border-link transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-link/10 flex items-center justify-center text-link font-bold">EN</div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-primary">English Localization</h4>
                                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">Global outreach and international readers</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${showEnglish ? 'rotate-180' : ''}`} />
                        </div>

                        {showEnglish && (
                            <div className="bg-app/50 p-8 rounded-[32px] border border-link/20 border-dashed space-y-6 animate-slide-down">
                                <input
                                    {...register('title_en')}
                                    className="w-full p-4 bg-surface border border-link/20 rounded-2xl text-lg font-black text-primary outline-none placeholder:text-muted focus:border-link"
                                    placeholder="Post Title in English"
                                />
                                <textarea
                                    {...register('content_en')}
                                    rows={6}
                                    className="w-full p-4 bg-surface border border-link/20 rounded-2xl text-sm font-medium text-primary outline-none placeholder:text-muted focus:border-link"
                                    placeholder="English content details..."
                                />
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-surface rounded-[40px] border border-app overflow-hidden shadow-xl">
                        <div className="bg-app/50 px-8 py-5 border-b border-app">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Context & Classification</h4>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">Lifecycle Stage</label>
                                <select
                                    {...register('status')}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-black text-primary outline-none focus:bg-surface focus:border-link transition-all appearance-none cursor-pointer"
                                >
                                    <option value="draft" className="text-primary">Internal Draft</option>
                                    <option value="published" className="text-primary">Live on Feed</option>
                                    <option value="scheduled" className="text-primary">Scheduled Launch</option>
                                    <option value="archived" className="text-primary">System Archive</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">Community Logic</label>
                                <select
                                    {...register('category_id', { required: true })}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-black text-primary outline-none focus:bg-surface focus:border-link transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-primary">Choose Taxonomy...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id} className="text-primary">{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1">System Slug (URL)</label>
                                <input
                                    {...register('slug', { required: true })}
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-xs font-mono font-bold text-link outline-none placeholder:text-muted focus:bg-surface focus:border-link"
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-surface rounded-[40px] border border-app overflow-hidden shadow-xl">
                        <div className="bg-app/50 px-8 py-5 border-b border-app flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Visual Asset</h4>
                        </div>
                        <div className="p-8">
                            <MediaUploader
                                value={coverImage}
                                onChange={(url: string | null) => {
                                    console.log('🔄 [Parent] MediaUploader onChange:', url);
                                    setCoverImage(prev => url);
                                }}
                                onUploading={setUploading}
                                folderPrefix="community"
                                noContainer
                            />
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}

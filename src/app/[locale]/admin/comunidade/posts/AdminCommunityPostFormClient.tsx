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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.cover_image_url || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: initialData || {
            status: 'draft',
            category_id: '',
            is_public: true
        }
    });

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

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                cover_image_url: coverImage,
                updated_at: new Date().toISOString()
            };

            if (id) {
                await communityService.updatePost(id, payload);
                toast.success('Post atualizado');
            } else {
                await communityService.createPost(payload);
                toast.success('Post criado');
            }
            router.push('/admin/comunidade/posts');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar post');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await storageService.uploadFile(file, 'community');
            setCoverImage(url);
            toast.success('Imagem enviada');
        } catch (error) {
            console.error(error);
            toast.error('Erro no upload');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Community</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5593C3]">Editor</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight">
                        {id ? 'Refine Post' : 'Craft Experience'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white border border-zinc-100 text-zinc-400 px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-zinc-50 transition-all"
                    >
                        DISCARD
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#D70F24] hover:bg-[#b50d1f] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {id ? 'UPDATE FEED' : 'LAUNCH POST'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <PenTool className="w-6 h-6 text-[#D70F24]" />
                            <h3 className="font-black text-xl tracking-tight text-[#1a1a1a]">Narrative Core</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Engagement Title</label>
                                <input
                                    {...register('title', { required: true })}
                                    className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-2xl font-black text-[#1a1a1a] focus:bg-white focus:border-[#5593C3] transition-all outline-none placeholder:text-zinc-200"
                                    placeholder="The impact of cultural exchange..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Explanatory Snippet</label>
                                <textarea
                                    {...register('excerpt')}
                                    rows={3}
                                    className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-600 focus:bg-white focus:border-[#5593C3] transition-all outline-none resize-none"
                                    placeholder="Briefly describe the essence of this discussion..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Full Discourse</label>
                                <textarea
                                    {...register('content', { required: true })}
                                    rows={15}
                                    className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium text-zinc-600 focus:bg-white focus:border-[#5593C3] transition-all outline-none"
                                    placeholder="Start writing your story here..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Multilingual Support */}
                    <section className="space-y-4">
                        <div
                            onClick={() => setShowJapanese(!showJapanese)}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 font-bold">JA</div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-[#1a1a1a]">Japanese Localization</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Translate content for the Nikkei community</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-zinc-300 transition-transform ${showJapanese ? 'rotate-180' : ''}`} />
                        </div>

                        {showJapanese && (
                            <div className="bg-zinc-50/50 p-8 rounded-[32px] border border-red-100 border-dashed space-y-6 animate-slide-down">
                                <input
                                    {...register('title_ja')}
                                    className="w-full p-4 bg-white border border-red-50 rounded-2xl text-lg font-black text-[#1a1a1a] outline-none"
                                    placeholder="日本語のタイトル"
                                />
                                <textarea
                                    {...register('content_ja')}
                                    rows={6}
                                    className="w-full p-4 bg-white border border-red-50 rounded-2xl text-sm font-medium outline-none"
                                    placeholder="日本語の内容..."
                                />
                            </div>
                        )}

                        <div
                            onClick={() => setShowEnglish(!showEnglish)}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold">EN</div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-[#1a1a1a]">English Localization</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Global outreach and international readers</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-zinc-300 transition-transform ${showEnglish ? 'rotate-180' : ''}`} />
                        </div>

                        {showEnglish && (
                            <div className="bg-zinc-50/50 p-8 rounded-[32px] border border-blue-100 border-dashed space-y-6 animate-slide-down">
                                <input
                                    {...register('title_en')}
                                    className="w-full p-4 bg-white border border-blue-50 rounded-2xl text-lg font-black text-[#1a1a1a] outline-none"
                                    placeholder="Post Title in English"
                                />
                                <textarea
                                    {...register('content_en')}
                                    rows={6}
                                    className="w-full p-4 bg-white border border-blue-50 rounded-2xl text-sm font-medium outline-none"
                                    placeholder="English content details..."
                                />
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white rounded-[40px] border border-zinc-100 overflow-hidden shadow-xl">
                        <div className="bg-zinc-50 px-8 py-5 border-b border-zinc-100">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Context & Classification</h4>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Lifecycle Stage</label>
                                <select
                                    {...register('status')}
                                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-black text-[#1a1a1a] outline-none focus:bg-white"
                                >
                                    <option value="draft">Internal Draft</option>
                                    <option value="published">Live on Feed</option>
                                    <option value="scheduled">Scheduled Launch</option>
                                    <option value="archived">System Archive</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Community Logic</label>
                                <select
                                    {...register('category_id', { required: true })}
                                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-black text-[#1a1a1a] outline-none focus:bg-white"
                                >
                                    <option value="">Choose Taxonomy...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">System Slug (URL)</label>
                                <input
                                    {...register('slug', { required: true })}
                                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-mono font-bold text-[#5593C3] outline-none"
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] border border-zinc-100 overflow-hidden shadow-xl">
                        <div className="bg-zinc-50 px-8 py-5 border-b border-zinc-100 flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Visual Asset</h4>
                            {uploading && <Loader2 className="w-4 h-4 animate-spin text-[#5593C3]" />}
                        </div>
                        <div className="p-8">
                            {coverImage ? (
                                <div className="relative group">
                                    <img src={coverImage} className="w-full h-48 object-cover rounded-[32px] shadow-lg ring-4 ring-zinc-50" />
                                    <button
                                        type="button"
                                        onClick={() => setCoverImage(null)}
                                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-48 border-2 border-dashed border-zinc-100 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Assign Cover Media</p>
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}

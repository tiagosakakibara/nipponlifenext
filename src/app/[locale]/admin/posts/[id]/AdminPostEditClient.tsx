"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useAdminPosts, AdminPost } from '../hooks/useAdminPosts';
import {
    Loader2, ChevronRight,
    Send, Image as ImageIcon, Trash2, Pin, MessageSquare, ChevronDown, Check,
    Globe, Wand2
} from 'lucide-react';
import { MediaUploader } from '@/components/MediaUploader';
import { QuillEditor } from '@/components/QuillEditor';
import { slugify } from '@/utils/slugify';
import { extractKeywords } from '@/utils/keywordExtractor';
import { toast } from 'react-hot-toast';

export default function AdminPostEditClient() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { categories, getPost, updatePost, loading: dataLoading } = useAdminPosts();
    const [formData, setFormData] = useState<AdminPost | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const post = await getPost(id);
            if (post) {
                setFormData(post);
                if (post.title_ja || post.content_ja) setShowJapanese(true);
                if (post.title_en || post.content_en) setShowEnglish(true);
            }
        };
        fetch();
    }, [id, getPost]);

    const validate = (data: AdminPost) => {
        const errors: Record<string, string> = {};
        if (!data.title?.trim()) errors.title = 'Título é obrigatório';
        if (!data.categoryKey || data.categoryKey === 'uncategorized') errors.category = 'Categoria é obrigatória';
        return errors;
    };

    const handleSaveDraft = async () => {
        if (!formData) return;
        setIsSaving(true);
        const success = await updatePost(id, {
            ...formData,
            status: 'draft',
            updatedAt: new Date().toISOString()
        });
        setIsSaving(false);
        if (success) {
            setLastSaved(new Date());
            toast.success('Rascunho salvo!');
        }
    };

    const handleAddTag = () => {
        if (!tagInput.trim() || !formData) return;
        const newTags = tagInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "");
        const currentTags = formData.tags || [];
        const uniqueNewTags = newTags.filter(tag => !currentTags.includes(tag));
        if (uniqueNewTags.length > 0) {
            setFormData({ ...formData, tags: [...currentTags, ...uniqueNewTags] });
        }
        setTagInput('');
    };

    const handleRemoveTag = (index: number) => {
        if (formData?.tags) {
            setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        const errors = validate(formData);
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            toast.error('Corrija os erros antes de salvar.');
            return;
        }

        setIsSaving(true);
        const success = await updatePost(id, {
            ...formData,
            updatedAt: new Date().toISOString()
        });
        setIsSaving(false);
        if (success) {
            toast.success('Post atualizado!');
            router.push('/admin/posts');
        }
    };

    if (dataLoading && !formData) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
            </div>
        );
    }

    if (!formData) return <div className="p-8 text-center text-secondary">Post não encontrado.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Breadcrumbs & Saved Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <nav className="flex items-center gap-2 text-xs font-medium text-secondary/60">
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin')}>Dashboard</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin/posts')}>News Management</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-secondary opacity-60">Edit Post</span>
                </nav>

                <div className="flex items-center gap-3 text-[10px] font-bold">
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                            <Check className="w-3 h-3" />
                            SALVO {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <textarea
                            rows={1}
                            placeholder="Enter news title..."
                            value={formData.title}
                            onChange={e => {
                                const newTitle = e.target.value;
                                setFormData(prev => prev ? ({ ...prev, title: newTitle, slug: slugify(newTitle) }) : null);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className={`w-full bg-transparent text-4xl md:text-5xl font-bold text-primary placeholder-primary/10 outline-none resize-none overflow-hidden transition-all duration-300 ${validationErrors.title ? 'border-b border-red-500/50' : 'border-none focus:border-b border-app pb-2'}`}
                        />
                        {validationErrors.title && <p className="text-red-500 text-xs">{validationErrors.title}</p>}

                        <div className="flex items-center gap-2 text-[10px] text-secondary bg-surface w-fit px-2 py-1 rounded border border-app">
                            <span className="uppercase font-bold tracking-widest text-[#5593C3]">Permalink:</span>
                            <span className="italic opacity-60">nippon-life.net/noticias/{formData.slug}</span>
                        </div>
                    </div>

                    <QuillEditor
                        content={formData.content || ''}
                        onChange={(html: string) => setFormData(prev => prev ? { ...prev, content: html } : null)}
                        placeholder="Start writing your news content here..."
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Excerpt (Summary)</label>
                        <textarea
                            rows={3}
                            value={formData.excerpt || ''}
                            onChange={e => setFormData(prev => prev ? ({ ...prev, excerpt: e.target.value }) : null)}
                            className="w-full bg-surface border border-app rounded-xl p-4 text-sm text-primary outline-none focus:border-link/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {(formData.tags || []).map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-link/10 text-link rounded-lg text-xs font-semibold border border-link/20">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(i)} className="hover:text-accent font-bold">×</button>
                                </span>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="bg-surface border border-app rounded-lg px-3 py-1 text-xs text-primary outline-none focus:border-link/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!formData) return;
                                        const tags = extractKeywords(`${formData.title} ${formData.content} ${formData.excerpt}`, 8);
                                        const currentTags = formData.tags || [];
                                        const newTags = tags.filter(t => !currentTags.includes(t));
                                        if (newTags.length > 0) {
                                            setFormData({ ...formData, tags: [...currentTags, ...newTags] });
                                            toast.success(`${newTags.length} tags geradas!`);
                                        }
                                    }}
                                    className="p-1 text-amber-500"
                                >
                                    <Wand2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Translations Section */}
                    <div className="bg-surface rounded-xl border border-app overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-app bg-[#0037680a] flex items-center gap-2">
                            <Globe className="w-5 h-5 text-link" />
                            <h3 className="text-sm font-bold text-primary tracking-tight">Traduções (Opcional)</h3>
                        </div>

                        <div className="border-b border-app text-sm">
                            <button
                                type="button"
                                onClick={() => setShowJapanese(!showJapanese)}
                                className="w-full p-4 flex items-center justify-between hover:bg-app/50"
                            >
                                <span className="flex items-center gap-3 font-bold text-secondary">
                                    <span className="w-6 h-6 rounded flex items-center justify-center bg-white border border-app text-[10px]">JP</span>
                                    Japonês (日本語)
                                </span>
                                {showJapanese ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {showJapanese && (
                                <div className="p-6 pt-2 space-y-6 bg-app/20">
                                    <input
                                        type="text"
                                        value={formData.title_ja || ''}
                                        onChange={e => setFormData(prev => prev ? ({ ...prev, title_ja: e.target.value }) : null)}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <QuillEditor
                                        content={formData.content_ja || ''}
                                        onChange={(html: string) => setFormData(prev => prev ? ({ ...prev, content_ja: html }) : null)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setShowEnglish(!showEnglish)}
                                className="w-full p-4 flex items-center justify-between hover:bg-app/50"
                            >
                                <span className="flex items-center gap-3 font-bold text-secondary">
                                    <span className="w-6 h-6 rounded flex items-center justify-center bg-white border border-app text-[10px]">EN</span>
                                    English
                                </span>
                                {showEnglish ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {showEnglish && (
                                <div className="p-6 pt-2 space-y-6 bg-app/20">
                                    <input
                                        type="text"
                                        value={formData.title_en || ''}
                                        onChange={e => setFormData(prev => prev ? ({ ...prev, title_en: e.target.value }) : null)}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <QuillEditor
                                        content={formData.content_en || ''}
                                        onChange={(html: string) => setFormData(prev => prev ? ({ ...prev, content_en: html }) : null)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface rounded-xl border border-app p-6 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Send className="w-4 h-4 text-link" />
                            <h3 className="font-bold text-sm">Publishing Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block">Status</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#0037680a] p-1 rounded-lg border border-app">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                                        className={`py-1.5 text-[10px] font-black rounded-md transition-all ${formData.status === 'draft' ? 'bg-white text-primary shadow-lg' : 'text-secondary hover:text-primary'}`}
                                    >
                                        DRAFT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'published' })}
                                        className={`py-1.5 text-[10px] font-black rounded-md transition-all ${formData.status === 'published' ? 'bg-[#5593C3] text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                                    >
                                        PUBLISHED
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block">Category</label>
                                <select
                                    value={formData.categoryKey}
                                    onChange={e => setFormData({ ...formData, categoryKey: e.target.value })}
                                    className={`w-full bg-app border rounded-lg px-4 py-2 text-xs ${validationErrors.category ? 'border-red-500/50 text-red-500' : 'border-app'}`}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                    ))}
                                </select>
                                {validationErrors.category && <p className="text-red-500 text-[10px] pt-1">{validationErrors.category}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-app p-6 shadow-xl space-y-4">
                        <h3 className="font-bold text-sm">Featured Image</h3>
                        <MediaUploader
                            value={formData.coverImageUrl}
                            onChange={(url) => setFormData(prev => prev ? ({ ...prev, coverImageUrl: url || '' }) : null)}
                            folderPrefix="posts"
                            noContainer
                        />
                    </div>

                    <div className="bg-surface rounded-xl border border-app p-4 shadow-xl space-y-4">
                        <div onClick={() => setFormData({ ...formData, pinned: !formData.pinned })} className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-bold uppercase text-secondary">Pin to top</span>
                            <div className={`w-10 h-5 rounded-full relative transition-all border ${formData.pinned ? 'bg-amber-500 border-amber-600' : 'bg-app border-app'}`}>
                                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${formData.pinned ? 'left-5.5' : 'left-0.5'}`} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#5593C3] hover:bg-[#467ba5] text-white py-3 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'UPDATE POST'}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button type="button" onClick={handleSaveDraft} className="w-full text-center text-[10px] font-extrabold text-[#5593C3] uppercase tracking-widest">
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
}

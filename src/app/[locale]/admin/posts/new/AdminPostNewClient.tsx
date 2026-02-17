"use client";

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAdminPosts, AdminPost } from '../hooks/useAdminPosts';
import { MediaUploader } from '@/components/MediaUploader';
import {
    X, Plus, ChevronRight,
    Send, Calendar, Image as ImageIcon, Trash2, Pin, MessageSquare, ChevronDown,
    Globe, Wand2, Loader2, ShieldAlert
} from 'lucide-react';
import { slugify } from '@/utils/slugify';
import { extractKeywords } from '@/utils/keywordExtractor';
import { toast } from 'react-hot-toast';
import { QuillEditor } from '@/components/QuillEditor';
import { usePermission } from '@/app/[locale]/admin/hooks/usePermission';

export default function AdminPostNewClient() {
    const router = useRouter();
    const t = useTranslations();
    const { hasAccess, loading: permissionLoading } = usePermission('posts');
    const { categories, addPost, loading } = useAdminPosts();
    const [formData, setFormData] = useState<Partial<AdminPost>>({
        title: '',
        slug: '',
        categoryKey: '',
        excerpt: '',
        content: '',
        status: 'draft',
        coverImageUrl: '',
        tags: [],
        title_ja: '',
        title_en: '',
        excerpt_ja: '',
        excerpt_en: '',
        content_ja: '',
        content_en: '',
        allowComments: true,
        pinned: false
    });
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    const validate = (data: Partial<AdminPost>) => {
        const errors: Record<string, string> = {};
        if (!data.title?.trim()) errors.title = t('admin.posts.form.validation.titleRequired');
        if (!data.categoryKey || data.categoryKey === 'uncategorized') errors.category = t('admin.posts.form.validation.categoryRequired');
        return errors;
    };

    const handleSaveDraft = async () => {
        if (!formData.title || !formData.categoryKey) {
            setValidationErrors(validate(formData));
            toast.error(t('admin.posts.form.messages.fillRequired'));
            return;
        }

        setIsSaving(true);
        const success = await addPost({
            ...formData,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, true);
        setIsSaving(false);
        if (success) {
            toast.success(t('admin.posts.form.messages.draftSuccess'));
            router.push('/admin/posts');
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && formData.tags) {
            const newTags = tagInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "");
            const uniqueNewTags = newTags.filter(tag => !formData.tags?.includes(tag));

            if (uniqueNewTags.length > 0) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, ...uniqueNewTags]
                });
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (index: number) => {
        if (formData.tags) {
            setFormData({
                ...formData,
                tags: formData.tags.filter((_, i) => i !== index)
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validate(formData);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error(t('admin.posts.form.messages.fixErrors'));
            return;
        }

        setIsSaving(true);
        const success = await addPost({
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined
        }, true);
        setIsSaving(false);
        if (success) {
            toast.success(t('admin.posts.form.messages.publishSuccess'));
            router.push('/admin/posts');
        }
    };

    if (permissionLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
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
                    Você não tem permissão para criar posts.
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
        <div className="space-y-8 animate-fade-in">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium text-secondary/60">
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin')}>{t('admin.dashboard')}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin/posts')}>{t('admin.posts.title')}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary font-bold">{t('admin.posts.create')}</span>
            </nav>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <textarea
                            rows={1}
                            placeholder={t('admin.posts.form.titlePlaceholder')}
                            value={formData.title}
                            onChange={e => {
                                const newTitle = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    title: newTitle,
                                    slug: slugify(newTitle)
                                }));
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className={`w-full bg-transparent text-4xl md:text-5xl font-bold text-primary placeholder-primary/10 outline-none resize-none overflow-hidden transition-all duration-300 ${validationErrors.title ? 'border-b border-red-500/50' : 'border-none focus:border-b border-app pb-2'}`}
                        />
                        {validationErrors.title && <p className="text-red-500 text-xs">{validationErrors.title}</p>}

                        <div className="flex items-center gap-2 text-[10px] text-secondary bg-surface w-fit px-2 py-1 rounded border border-app">
                            <span className="uppercase font-bold tracking-widest text-[#5593C3]">{t('admin.posts.form.permalink')}</span>
                            <span className="italic opacity-60">nippon-life.net/noticias/{formData.slug || '...'}</span>
                        </div>
                    </div>

                    <QuillEditor
                        content={formData.content || ''}
                        onChange={(html: string) => setFormData({ ...formData, content: html })}
                        placeholder={t('admin.posts.form.contentPlaceholder')}
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{t('admin.posts.form.excerptLabel')}</label>
                        <textarea
                            rows={3}
                            value={formData.excerpt}
                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full bg-surface border border-app rounded-xl p-4 text-sm text-primary outline-none focus:border-link/50 transition-colors"
                            placeholder={t('admin.posts.form.excerptPlaceholder')}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{t('admin.posts.form.tagsLabel')}</label>
                        <div className="flex flex-wrap gap-2">
                            {(formData.tags || []).map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-link/10 text-link rounded-lg text-xs font-semibold border border-link/20">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(i)} className="hover:text-accent font-bold">
                                        ×
                                    </button>
                                </span>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder={t('admin.posts.form.addTagPlaceholder')}
                                    className="bg-surface border border-app rounded-lg px-3 py-1 text-xs text-primary outline-none focus:border-link/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tags = extractKeywords(`${formData.title} ${formData.content} ${formData.excerpt}`, 8);
                                        const currentTags = formData.tags || [];
                                        const newTags = tags.filter(t => !currentTags.includes(t));
                                        if (newTags.length > 0) {
                                            setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), ...newTags] }));
                                            toast.success(t('admin.posts.form.messages.tagsGenerated', { count: newTags.length }));
                                        }
                                    }}
                                    className="p-1 hover:bg-app rounded text-amber-500"
                                    title={t('admin.posts.form.tagsGenerateTitle')}
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
                            <h3 className="text-sm font-bold text-primary tracking-tight">{t('admin.posts.form.translationsLabel')}</h3>
                        </div>

                        <div className="border-b border-app text-sm">
                            <button
                                type="button"
                                onClick={() => setShowJapanese(!showJapanese)}
                                className="w-full p-4 flex items-center justify-between hover:bg-app/50 transition-colors"
                            >
                                <span className="flex items-center gap-3 font-bold text-secondary">
                                    <span className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm border border-app text-[10px]">JP</span>
                                    {t('admin.posts.form.japaneseLabel')}
                                </span>
                                {showJapanese ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {showJapanese && (
                                <div className="p-6 pt-2 space-y-6 bg-app/20">
                                    <input
                                        type="text"
                                        value={formData.title_ja || ''}
                                        onChange={e => setFormData({ ...formData, title_ja: e.target.value })}
                                        placeholder={t('admin.posts.form.titleJaPlaceholder')}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2 outline-none focus:border-link/50"
                                    />
                                    <textarea
                                        rows={2}
                                        value={formData.excerpt_ja || ''}
                                        onChange={e => setFormData({ ...formData, excerpt_ja: e.target.value })}
                                        placeholder={t('admin.posts.form.excerptJaPlaceholder')}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2 text-sm outline-none focus:border-link/50"
                                    />
                                    <QuillEditor
                                        content={formData.content_ja || ''}
                                        onChange={(html: string) => setFormData({ ...formData, content_ja: html })}
                                        placeholder={t('admin.posts.form.contentJaPlaceholder')}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setShowEnglish(!showEnglish)}
                                className="w-full p-4 flex items-center justify-between hover:bg-app/50 transition-colors"
                            >
                                <span className="flex items-center gap-3 font-bold text-secondary">
                                    <span className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm border border-app text-[10px]">EN</span>
                                    {t('admin.posts.form.englishLabel')}
                                </span>
                                {showEnglish ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {showEnglish && (
                                <div className="p-6 pt-2 space-y-6 bg-app/20">
                                    <input
                                        type="text"
                                        value={formData.title_en || ''}
                                        onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                        placeholder={t('admin.posts.form.titleEnPlaceholder')}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2 outline-none focus:border-link/50"
                                    />
                                    <textarea
                                        rows={2}
                                        value={formData.excerpt_en || ''}
                                        onChange={e => setFormData({ ...formData, excerpt_en: e.target.value })}
                                        placeholder={t('admin.posts.form.excerptEnPlaceholder')}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2 text-sm outline-none focus:border-link/50"
                                    />
                                    <QuillEditor
                                        content={formData.content_en || ''}
                                        onChange={(html: string) => setFormData({ ...formData, content_en: html })}
                                        placeholder={t('admin.posts.form.contentEnPlaceholder')}
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
                            <h3 className="font-bold text-sm">{t('admin.posts.form.publishingSettings')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block">{t('admin.posts.form.statusLabel')}</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#0037680a] p-1 rounded-lg border border-app">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                                        className={`py-1.5 text-[10px] font-black rounded-md transition-all ${formData.status === 'draft' ? 'bg-white text-primary shadow-lg' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('admin.posts.form.statusDraft')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'published' })}
                                        className={`py-1.5 text-[10px] font-black rounded-md transition-all ${formData.status === 'published' ? 'bg-[#5593C3] text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                                    >
                                        {t('admin.posts.form.statusPublished')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block">{t('admin.posts.form.categoryLabel')}</label>
                                <select
                                    value={formData.categoryKey}
                                    onChange={e => setFormData({ ...formData, categoryKey: e.target.value })}
                                    className="w-full bg-app border border-app rounded-lg px-4 py-2 text-xs outline-none"
                                >
                                    <option value="">{t('admin.posts.form.selectCategory')}</option>
                                    {categories.map(cat => (
                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                    ))}
                                </select>
                                {validationErrors.category && <p className="text-red-500 text-[10px]">{validationErrors.category}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-app p-6 shadow-xl space-y-4">
                        <h3 className="font-bold text-sm">{t('admin.posts.form.featuredImage')}</h3>
                        <MediaUploader
                            value={formData.coverImageUrl}
                            onChange={(url) => setFormData({ ...formData, coverImageUrl: url || '' })}
                            folderPrefix="posts"
                            noContainer
                        />
                    </div>

                    <div className="bg-surface rounded-xl border border-app p-4 shadow-xl space-y-4">
                        <div
                            onClick={() => setFormData({ ...formData, pinned: !formData.pinned })}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <span className="text-xs font-bold uppercase text-secondary">{t('admin.posts.form.pinToTop')}</span>
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
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.posts.form.publishButton')}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button type="button" onClick={handleSaveDraft} className="w-full text-center text-[10px] font-extrabold text-[#5593C3] uppercase tracking-widest">
                        {t('admin.posts.form.saveDraftButton')}
                    </button>
                </div>
            </form>
        </div>
    );
}

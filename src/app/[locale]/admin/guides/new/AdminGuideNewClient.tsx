"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAdminGuides, AdminGuide } from '../hooks/useAdminGuides';
import {
    Loader2, ChevronRight,
    Send, ChevronDown, Check,
    Globe, Clock
} from 'lucide-react';
import { MediaUploader } from '@/components/MediaUploader';
import { QuillEditor } from '@/components/QuillEditor';
import { slugify } from '@/utils/slugify';
import { toast } from 'react-hot-toast';

export default function AdminGuideNewClient() {
    const router = useRouter();
    const { categories, addGuide, fetchGuides } = useAdminGuides();

    // Initialize with empty guide
    const [formData, setFormData] = useState<Partial<AdminGuide>>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        categoryKey: '',
        readingTimeMinutes: 5,
        coverImageUrl: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showJapanese, setShowJapanese] = useState(false);
    const [showEnglish, setShowEnglish] = useState(false);

    useEffect(() => {
        fetchGuides(); // To load categories
    }, [fetchGuides]);

    const validate = (data: Partial<AdminGuide>) => {
        const errors: Record<string, string> = {};
        if (!data.title?.trim()) errors.title = 'Título é obrigatório';
        if (!data.categoryKey) errors.category = 'Categoria é obrigatória';
        return errors;
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
        const success = await addGuide({
            ...formData,
            slug: formData.slug || slugify(formData.title || ''),
            updatedAt: new Date().toISOString()
        });
        setIsSaving(false);
        if (success) {
            toast.success('Guia criado com sucesso!');
            router.push('/admin/guides');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <nav className="flex items-center gap-2 text-xs font-medium text-secondary/60">
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin')}>Dashboard</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/admin/guides')}>Guias</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-secondary opacity-60">Novo Guia</span>
                </nav>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <textarea
                            rows={1}
                            placeholder="Título do Guia..."
                            value={formData.title}
                            onChange={e => {
                                const newTitle = e.target.value;
                                setFormData(prev => ({ ...prev, title: newTitle, slug: slugify(newTitle) }));
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className={`w-full bg-transparent text-4xl md:text-5xl font-bold text-primary placeholder-primary/10 outline-none resize-none overflow-hidden transition-all duration-300 ${validationErrors.title ? 'border-b border-red-500/50' : 'border-none focus:border-b border-app pb-2'}`}
                        />
                        {validationErrors.title && <p className="text-red-500 text-xs">{validationErrors.title}</p>}

                        <div className="flex items-center gap-2 text-[10px] text-secondary bg-surface w-fit px-2 py-1 rounded border border-app">
                            <span className="uppercase font-bold tracking-widest text-[#5593C3]">Permalink:</span>
                            <span className="italic opacity-60">nippon-life.net/guias/{formData.slug}</span>
                        </div>
                    </div>

                    <QuillEditor
                        content={formData.content || ''}
                        onChange={(html: string) => setFormData(prev => ({ ...prev, content: html }))}
                        placeholder="Escreva o conteúdo do guia..."
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Resumo (Excerpt)</label>
                        <textarea
                            rows={3}
                            value={formData.excerpt || ''}
                            onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                            className="w-full bg-surface border border-app rounded-xl p-4 text-sm text-primary outline-none focus:border-link/50 transition-colors"
                        />
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
                                        placeholder="Título em Japonês"
                                        value={formData.title_ja || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, title_ja: e.target.value }))}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="Resumo em Japonês"
                                        value={formData.excerpt_ja || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, excerpt_ja: e.target.value }))}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <QuillEditor
                                        content={formData.content_ja || ''}
                                        onChange={(html: string) => setFormData(prev => ({ ...prev, content_ja: html }))}
                                        className="h-[300px]"
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
                                        placeholder="Título em Inglês"
                                        value={formData.title_en || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="Resumo em Inglês"
                                        value={formData.excerpt_en || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                                        className="w-full bg-surface border border-app rounded-lg px-4 py-2"
                                    />
                                    <QuillEditor
                                        content={formData.content_en || ''}
                                        onChange={(html: string) => setFormData(prev => ({ ...prev, content_en: html }))}
                                        className="h-[300px]"
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
                            <h3 className="font-bold text-sm">Configuração de Publicação</h3>
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
                                <label className="text-[10px] font-extrabold text-secondary uppercase block">Categoria</label>
                                <select
                                    value={formData.categoryKey}
                                    onChange={e => setFormData({ ...formData, categoryKey: e.target.value })}
                                    className={`w-full bg-app border rounded-lg px-4 py-2 text-xs ${validationErrors.category ? 'border-red-500' : 'border-app'}`}
                                >
                                    <option value="">Selecione Categoria</option>
                                    {categories.map((cat) => (
                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                    ))}
                                </select>
                                {validationErrors.category && <p className="text-red-500 text-xs">{validationErrors.category}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-secondary uppercase block flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Tempo de Leitura (min)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.readingTimeMinutes}
                                    onChange={e => setFormData({ ...formData, readingTimeMinutes: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-app border border-app rounded-lg px-4 py-2 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-app p-6 shadow-xl space-y-4">
                        <h3 className="font-bold text-sm">Imagem de Capa</h3>
                        <MediaUploader
                            value={formData.coverImageUrl || ''}
                            onChange={(url) => setFormData({ ...formData, coverImageUrl: url || '' })}
                            folderPrefix="guides"
                            noContainer
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#5593C3] hover:bg-[#467ba5] text-white py-3 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CRIAR GUIA'}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </form>
        </div>
    );
}


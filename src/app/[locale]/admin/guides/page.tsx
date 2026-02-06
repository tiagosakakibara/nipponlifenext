"use client";

import { useTranslations } from 'next-intl';
import { BookOpen, Plus, Eye, Trash2, Edit2, FileText, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Guide {
    id: string;
    title: string;
    excerpt: string | null;
    slug: string;
    view_count: number;
    created_at: string;
    status: string;
    guides_categories: {
        name: string;
        slug: string;
    } | null;
}

export default function AdminGuidesPage() {
    const t = useTranslations();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('guides')
                .select('*, guides_categories(name, slug)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGuides(data || []);
        } catch (err) {
            console.error('Error fetching guides:', err);
            setError('Erro ao carregar guias');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este guia?')) return;

        try {
            const { error } = await supabase
                .from('guides')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setGuides(guides.filter(g => g.id !== id));
        } catch (err) {
            console.error('Error deleting guide:', err);
            alert('Erro ao deletar guia');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-link" />
                    <p className="text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-[#D70F24]" />
                        Guias de Usuário
                    </h1>
                    <p className="text-secondary text-sm mt-1">Gerencie guias e tutoriais do site</p>
                </div>
                <Link
                    href="/admin/guides/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D70F24] to-rose-600 hover:to-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#D70F24]/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Novo Guia
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Total de Guias</p>
                            <h3 className="text-4xl font-black text-primary">{guides.length}</h3>
                        </div>
                        <div className="p-4 rounded-xl bg-[#D70F24]/10">
                            <FileText className="w-8 h-8 text-[#D70F24]" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Publicados</p>
                            <h3 className="text-4xl font-black text-primary">
                                {guides.filter(g => g.status === 'published').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10">
                            <BookOpen className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Total de Views</p>
                            <h3 className="text-4xl font-black text-primary">
                                {guides.reduce((acc, g) => acc + (g.view_count || 0), 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10">
                            <Eye className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                    {error}
                </div>
            )}

            {/* Guides List */}
            {guides.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border-2 border-dashed border-app">
                    <BookOpen className="w-16 h-16 text-secondary/20 mx-auto mb-4" />
                    <p className="text-secondary/40 font-bold uppercase tracking-widest">Nenhum guia encontrado</p>
                    <Link
                        href="/admin/guides/new"
                        className="inline-flex items-center gap-2 mt-4 text-link hover:underline font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Criar primeiro guia
                    </Link>
                </div>
            ) : (
                <div className="bg-surface rounded-2xl border border-app shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-app/50 border-b border-app">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-black text-secondary uppercase tracking-widest">Título</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-secondary uppercase tracking-widest">Categoria</th>
                                <th className="text-center px-6 py-4 text-xs font-black text-secondary uppercase tracking-widest">Views</th>
                                <th className="text-center px-6 py-4 text-xs font-black text-secondary uppercase tracking-widest">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-black text-secondary uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {guides.map((guide) => (
                                <tr key={guide.id} className="hover:bg-app/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <h3 className="font-bold text-primary">{guide.title}</h3>
                                            {guide.excerpt && (
                                                <p className="text-sm text-secondary line-clamp-1 mt-1">{guide.excerpt}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-3 py-1 bg-link/10 text-link rounded-full text-xs font-bold">
                                            {guide.guides_categories?.name || 'Sem categoria'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-secondary">
                                            <Eye className="w-4 h-4" />
                                            <span className="font-bold">{guide.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                            guide.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'bg-secondary/10 text-secondary'
                                        }`}>
                                            {guide.status === 'published' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/guides/${guide.id}`}
                                                className="inline-flex items-center gap-1 bg-link/10 hover:bg-link/20 text-link px-3 py-1.5 rounded-lg font-bold transition-colors text-sm"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(guide.id)}
                                                className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg font-bold transition-colors text-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

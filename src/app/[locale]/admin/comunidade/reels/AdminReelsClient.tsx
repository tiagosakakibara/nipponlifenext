"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
    Plus, Search, Trash2, Loader2,
    Video, ExternalLink, RefreshCw, X, Play, Save, Pencil, ShieldAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { fetchActiveReels, parseReelUrl, CommunityReel } from '@/lib/reelsService';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { usePermission } from '@/app/[locale]/admin/hooks/usePermission';

export default function AdminReelsClient() {
    const { hasAccess, loading: permissionLoading } = usePermission('reels');
    const [reels, setReels] = useState<CommunityReel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newReelUrl, setNewReelUrl] = useState('');
    const [newReelTitle, setNewReelTitle] = useState('');
    const [previewData, setPreviewData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
    const [editingTitleValue, setEditingTitleValue] = useState('');

    const fetchReels = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('community_reels')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setReels(data as CommunityReel[]);
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasAccess) return;
        fetchReels();
    }, [hasAccess]);

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
                    Você não tem permissão para gerenciar reels.
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

    const handleUrlChange = (url: string) => {
        setNewReelUrl(url);
        if (!url) {
            setPreviewData(null);
            return;
        }
        const parsed = parseReelUrl(url);
        if (parsed.isValid) {
            setPreviewData(parsed);
        } else {
            setPreviewData({ error: parsed.errorMessage });
        }
    };

    const handleAddReel = async () => {
        if (!previewData || !previewData.isValid) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('community_reels').insert({
                url: newReelUrl,
                title: newReelTitle.trim() || 'Novo Reel',
                provider: previewData.provider,
                youtube_video_id: previewData.youtubeVideoId,
                thumbnail_url: previewData.thumbnailUrl,
                is_active: true,
                sort_order: 0
            });

            if (error) throw error;

            setIsAddModalOpen(false);
            setNewReelUrl('');
            setNewReelTitle('');
            setPreviewData(null);
            toast.success('Reel adicionado com sucesso!');
            fetchReels();
        } catch (error) {
            toast.error('Erro ao adicionar Reel');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este Reel?')) return;
        try {
            const { error } = await supabase.from('community_reels').delete().eq('id', id);
            if (error) throw error;
            setReels(reels.filter(r => r.id !== id));
            toast.success('Reel excluído');
        } catch (error) {
            toast.error('Erro ao excluir');
        }
    };

    const toggleStatus = async (reel: CommunityReel) => {
        try {
            const { error } = await supabase
                .from('community_reels')
                .update({ is_active: !reel.is_active })
                .eq('id', reel.id);

            if (error) throw error;

            setReels(reels.map(r => r.id === reel.id ? { ...r, is_active: !r.is_active } : r));
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const handleSaveTitle = async (reelId: string) => {
        try {
            const { error } = await supabase
                .from('community_reels')
                .update({ title: editingTitleValue.trim() })
                .eq('id', reelId);

            if (error) throw error;

            setReels(reels.map(r => r.id === reelId ? { ...r, title: editingTitleValue.trim() } : r));
            setEditingTitleId(null);
            toast.success('Título atualizado!');
        } catch (error) {
            toast.error('Erro ao salvar título');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Reels da Comunidade</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">Gerencie vídeos curtos da comunidade</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[#D70F24] hover:bg-[#b50d1f] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        ADICIONAR REEL
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-surface rounded-[40px] border border-app shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-app/50 text-[#D70F24] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app">
                            <tr>
                                <th className="px-8 py-6">Vídeo</th>
                                <th className="px-8 py-6">Título</th>
                                <th className="px-8 py-6">Provedor</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-[#D70F24] animate-spin" />
                                            <span className="text-secondary font-extrabold uppercase tracking-widest text-[10px]">Carregando Reels...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : reels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center text-secondary italic font-medium">
                                        Nenhum reel encontrado. Adicione o primeiro!
                                    </td>
                                </tr>
                            ) : (
                                reels.map((reel) => (
                                    <tr key={reel.id} className="group hover:bg-app/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-24 h-40 bg-black rounded-lg overflow-hidden shadow-md flex-shrink-0">
                                                    {reel.thumbnail_url ? (
                                                        <Image src={reel.thumbnail_url} fill className="object-cover opacity-80" alt="" sizes="96px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                            <Video className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                            <Play className="w-3 h-3 text-white fill-current" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <a href={reel.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-[#D70F24] transition-colors line-clamp-1 max-w-[200px] flex items-center gap-2 text-sm">
                                                        <ExternalLink className="w-3 h-3 text-secondary flex-shrink-0" />
                                                        Abrir vídeo
                                                    </a>
                                                    <p className="text-[10px] font-mono text-secondary">ID: {reel.youtube_video_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {editingTitleId === reel.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingTitleValue}
                                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(reel.id); if (e.key === 'Escape') setEditingTitleId(null); }}
                                                        className="w-full p-2 bg-app/50 border border-app rounded-lg text-primary font-medium text-sm outline-none focus:border-[#D70F24] transition-all"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveTitle(reel.id)}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTitleId(null)}
                                                        className="p-2 text-secondary hover:bg-app rounded-lg transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group/title">
                                                    <span className="font-bold text-primary text-sm">{reel.title || '—'}</span>
                                                    <button
                                                        onClick={() => { setEditingTitleId(reel.id); setEditingTitleValue(reel.title || ''); }}
                                                        className="p-1.5 text-secondary hover:text-[#D70F24] hover:bg-app rounded-lg transition-all opacity-0 group-hover/title:opacity-100"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-app/50 text-secondary rounded-full text-[9px] font-black uppercase tracking-widest border border-app">
                                                {reel.provider}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => toggleStatus(reel)}
                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${reel.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'bg-app/50 text-secondary border-app hover:bg-app'
                                                    }`}
                                            >
                                                {reel.is_active ? 'Ativo' : 'Oculto'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleDelete(reel.id)}
                                                    className="p-3 text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up border border-app">
                        <div className="p-8 border-b border-app flex items-center justify-between bg-app/30">
                            <h2 className="text-xl font-black text-primary">Adicionar Novo Reel</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-app rounded-full transition-colors">
                                <X className="w-5 h-5 text-secondary" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-secondary">Título do Vídeo</label>
                                <input
                                    type="text"
                                    value={newReelTitle}
                                    onChange={(e) => setNewReelTitle(e.target.value)}
                                    placeholder="Ex: Dicas de culinária japonesa"
                                    className="w-full p-4 bg-app/50 border border-app rounded-xl font-medium text-primary outline-none focus:border-[#D70F24] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-secondary">URL do Vídeo (YouTube/Shorts)</label>
                                <input
                                    type="text"
                                    value={newReelUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    placeholder="https://youtube.com/shorts/..."
                                    className="w-full p-4 bg-app/50 border border-app rounded-xl font-medium text-primary outline-none focus:border-[#D70F24] transition-all"
                                />
                                {previewData?.error && (
                                    <p className="text-xs font-bold text-red-500">{previewData.error}</p>
                                )}
                            </div>

                            {previewData?.isValid && (
                                <div className="bg-app/50 rounded-2xl p-4 border border-app flex gap-4">
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <Image src={previewData.thumbnailUrl} fill className="object-cover rounded-lg bg-black/10" alt="Preview" sizes="80px" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Link {previewData.provider} válido ✓</p>
                                        <p className="text-xs text-secondary">ID: {previewData.youtubeVideoId}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleAddReel}
                                disabled={!previewData?.isValid || submitting}
                                className="w-full py-4 bg-[#D70F24] text-white font-black rounded-2xl hover:bg-[#b50d1f] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                SALVAR REEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

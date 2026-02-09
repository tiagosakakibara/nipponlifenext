"use strict";
"use client";

import { useEffect, useState } from 'react';
import {
    Plus, Search, Trash2, Loader2,
    Video, ExternalLink, RefreshCw, X, Play, Save
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { fetchActiveReels, parseReelUrl, CommunityReel } from '@/lib/reelsService';
import { useTranslations } from 'next-intl';

export default function AdminReelsClient() {
    const [reels, setReels] = useState<CommunityReel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newReelUrl, setNewReelUrl] = useState('');
    const [previewData, setPreviewData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchReels = async () => {
        setLoading(true);
        try {
            // Fetch ALL reels (active and inactive) for admin
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
        fetchReels();
    }, []);

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
                title: 'Novo Reel', // Optional, can be updated later
                provider: previewData.provider,
                youtube_video_id: previewData.youtubeVideoId,
                thumbnail_url: previewData.thumbnailUrl,
                is_active: true,
                sort_order: 0
            });

            if (error) throw error;

            setIsAddModalOpen(false);
            setNewReelUrl('');
            setPreviewData(null);
            fetchReels();
        } catch (error) {
            alert('Erro ao adicionar Reel');
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
        } catch (error) {
            alert('Erro ao excluir');
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
            alert('Erro ao atualizar status');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Community Reels</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium italic opacity-60">Manage video content for the community</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[#D70F24] hover:bg-[#b50d1f] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        ADD NEW REEL
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-white/5 rounded-[40px] border border-zinc-100 dark:border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-[#D70F24] text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-6">Video Asset</th>
                                <th className="px-8 py-6">Provider</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-[#D70F24] animate-spin" />
                                            <span className="text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest text-[10px]">Loading Reels...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : reels.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center text-zinc-300 dark:text-zinc-600 italic font-medium">
                                        No reels found. Add your first one!
                                    </td>
                                </tr>
                            ) : (
                                reels.map((reel) => (
                                    <tr key={reel.id} className="group hover:bg-red-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-24 h-40 bg-black rounded-lg overflow-hidden shadow-md flex-shrink-0">
                                                    {reel.thumbnail_url ? (
                                                        <img src={reel.thumbnail_url} className="w-full h-full object-cover opacity-80" alt="" />
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
                                                    <a href={reel.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1a1a1a] dark:text-white hover:text-[#D70F24] transition-colors line-clamp-2 max-w-[300px] flex items-center gap-2">
                                                        {reel.url}
                                                        <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                                                    </a>
                                                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">ID: {reel.youtube_video_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-white/10">
                                                {reel.provider}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => toggleStatus(reel)}
                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${reel.is_active
                                                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'bg-zinc-100 dark:bg-white/10 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/20'
                                                    }`}
                                            >
                                                {reel.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleDelete(reel.id)}
                                                    className="p-3 text-zinc-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
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
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
                        <div className="p-8 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/5">
                            <h2 className="text-xl font-black text-[#1a1a1a] dark:text-white">Add New Reel</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Video URL (YouTube/Shorts)</label>
                                <input
                                    type="text"
                                    value={newReelUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    placeholder="https://youtube.com/shorts/..."
                                    className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl font-medium text-[#1a1a1a] dark:text-white outline-none focus:border-[#D70F24] transition-all"
                                />
                                {previewData?.error && (
                                    <p className="text-xs font-bold text-red-500 dark:text-red-400">{previewData.error}</p>
                                )}
                            </div>

                            {previewData?.isValid && (
                                <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 border border-zinc-100 dark:border-white/10 flex gap-4">
                                    <img src={previewData.thumbnailUrl} className="w-20 h-20 object-cover rounded-lg bg-black/10" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Valid {previewData.provider} link</p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">ID: {previewData.youtubeVideoId}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleAddReel}
                                disabled={!previewData?.isValid || submitting}
                                className="w-full py-4 bg-[#D70F24] text-white font-black rounded-2xl hover:bg-[#b50d1f] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                SAVE REEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

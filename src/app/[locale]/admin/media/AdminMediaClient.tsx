"use client";

import { useEffect, useState, useRef } from 'react';
import {
    Upload, Search, Trash2, Image as ImageIcon, Copy,
    ExternalLink, FileText, Film, MoreVertical,
    CheckCircle2, AlertCircle, Loader2, X
} from 'lucide-react';
import { useAdminMedia } from './hooks/useAdminMedia';
import { toast } from 'react-hot-toast';

export default function AdminMediaClient() {
    const { media, loading, fetchMedia, uploadMedia, deleteMedia } = useAdminMedia();
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        for (const file of files) {
            await uploadMedia(file);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filtered = media.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' ||
            (filterType === 'image' && item.type.startsWith('image/')) ||
            (filterType === 'video' && item.type.startsWith('video/'));
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Media Repository</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">Visual assets and community documents</p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept="image/*,video/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        BULK UPLOAD
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-4 rounded-3xl border border-app shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 group-focus-within:text-link transition-colors" />
                    <input
                        type="text"
                        placeholder="Search media library..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary placeholder:text-secondary/30 outline-none focus:border-link transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'image', 'video'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type
                                    ? 'bg-link text-white shadow-lg shadow-link/20'
                                    : 'bg-[#0037680a] text-secondary hover:bg-[#00376815]'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                    <div className="h-4 w-px bg-app mx-2 hidden md:block" />
                    <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] whitespace-nowrap">
                        {filtered.length} Items Found
                    </span>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-link animate-spin" />
                    <p className="text-secondary/50 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Cloud Assets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-surface border-2 border-dashed border-app rounded-[40px] p-20 text-center">
                    <div className="w-20 h-20 bg-app rounded-3xl flex items-center justify-center mb-6">
                        <ImageIcon className="w-8 h-8 text-secondary/20" />
                    </div>
                    <h3 className="text-xl font-black text-primary mb-2 italic">Ghost Library</h3>
                    <p className="text-secondary/50 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                        No assets found matching your criteria. Start by uploading some high-quality media.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-surface border border-app rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all aspect-square cursor-default"
                        >
                            {item.type.startsWith('image/') ? (
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#0037680a] flex items-center justify-center">
                                    <Film className="w-8 h-8 text-link/40" />
                                </div>
                            )}

                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="space-y-0.5">
                                        <p className="text-white text-[10px] font-black truncate uppercase tracking-widest">{item.name}</p>
                                        <p className="text-white/50 text-[9px] font-bold uppercase tracking-tight">{formatSize(item.size)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(item.url)}
                                            className="flex-1 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md p-2.5 rounded-xl transition-all flex items-center justify-center"
                                            title="Copy Link"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-link hover:bg-[#467ba5] text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-link/20"
                                            title="View Original"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => deleteMedia(item.id, item.url)}
                                            className="flex-1 bg-red-500/20 hover:bg-red-500 text-white backdrop-blur-md p-2.5 rounded-xl transition-all flex items-center justify-center"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Type Indicator */}
                            <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md rounded-lg p-1.5 border border-white/10 opacity-60 group-hover:opacity-0 transition-opacity">
                                {item.type.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5 text-white" /> : <Film className="w-3.5 h-3.5 text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

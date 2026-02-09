"use client";

import { useEffect, useState } from 'react';
import {
    Plus, Search, Filter, Eye, Heart, MessageCircle,
    Trash2, Edit, Archive, Send, FileText, Loader2,
    Calendar, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { useAdminCommunityPosts } from './hooks/useAdminCommunityPosts';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function AdminCommunityPostsClient() {
    const { posts, loading, fetchPosts, deletePost } = useAdminCommunityPosts();
    const t = useTranslations('Admin'); // Just in case, using mock for now or standard next-intl
    const locale = useLocale();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const filtered = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'published': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'draft': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400';
            case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'archived': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1a1a1a] dark:text-white tracking-tight">Community Feed</h1>
                    <p className="text-zinc-500 mt-1 font-medium italic opacity-60 dark:text-zinc-400">Moderate user discussions and insights</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/comunidade/posts/new"
                        className="flex items-center gap-2 bg-[#D70F24] hover:bg-[#b50d1f] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        PUBLISH NEW POST
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Posts', value: posts.length, icon: FileText, color: 'blue' },
                    { label: 'Published', value: posts.filter(p => p.status === 'published').length, icon: Send, color: 'emerald' },
                    { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, icon: Edit, color: 'zinc' },
                    { label: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, icon: Calendar, color: 'blue' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-zinc-100 dark:border-white/10 shadow-sm flex items-center justify-between group hover:border-[#5593C3] transition-all">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-[#1a1a1a] dark:text-white tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-zinc-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-[#5593C3] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search community posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl text-xs font-bold text-[#1a1a1a] dark:text-white placeholder:text-zinc-300 outline-none focus:border-[#5593C3] transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'published', 'draft', 'scheduled', 'archived'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status
                                ? 'bg-[#5593C3] text-white shadow-lg shadow-blue-500/20'
                                : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-white/5 rounded-[40px] border border-zinc-100 dark:border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-6">Engagement Asset</th>
                                <th className="px-8 py-6">Classification</th>
                                <th className="px-8 py-6">Lifecycle Status</th>
                                <th className="px-8 py-6 text-center">Metrics</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-[#5593C3] animate-spin" />
                                            <span className="text-zinc-400 font-extrabold uppercase tracking-widest text-[10px]">Filtering Insight Repository...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center text-zinc-300 italic font-medium">
                                        Zero results matched your current configuration.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((post) => (
                                    <tr key={post.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                {post.cover_image_url ? (
                                                    <img src={post.cover_image_url} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-white dark:ring-white/5" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center text-zinc-200 dark:text-white/20">
                                                        <FileText className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <p className="font-black text-[#1a1a1a] dark:text-white group-hover:text-[#5593C3] transition-colors text-lg tracking-tight leading-tight uppercase truncate max-w-[200px]">
                                                        {post.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono font-black text-zinc-300 dark:text-zinc-500">/{post.slug}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-300 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-white/5">
                                                {post.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(post.status)}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Views</p>
                                                    <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 tabular-nums">{post.view_count}</p>
                                                </div>
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Likes</p>
                                                    <p className="text-xs font-black text-pink-500 tabular-nums">{post.like_count}</p>
                                                </div>
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Comm</p>
                                                    <p className="text-xs font-black text-[#5593C3] tabular-nums">{post.comment_count}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <Link
                                                    href={`/admin/comunidade/posts/${post.id}`}
                                                    className="p-3 text-zinc-400 hover:text-[#5593C3] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => deletePost(post.id)}
                                                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
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
        </div>
    );
}

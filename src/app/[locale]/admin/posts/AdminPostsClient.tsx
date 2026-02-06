"use client";

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAdminPosts } from './hooks/useAdminPosts';
import { Trash2, Edit, Plus, FileText, Globe, Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminPostsClient() {
    const t = useTranslations();
    const router = useRouter();
    const { posts, deletePost, loading, fetchPosts } = useAdminPosts();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const filteredPosts = posts.filter(p => {
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleDelete = async (id: string, title: string) => {
        await deletePost(id);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-link" />
                        {t('admin.menu.posts')}
                    </h1>
                    <p className="text-secondary text-sm mt-1">Publique e gerencie artigos, notícias e novidades.</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center gap-2 bg-[#5593C3] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Novo Post
                </Link>
            </div>

            {/* Filters Area */}
            <div className="bg-surface border border-app rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1 p-1 bg-app/50 rounded-xl border border-app w-full md:w-auto overflow-x-auto">
                    {['all', 'published', 'draft'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status
                                ? 'bg-[#5593C3] text-white shadow-md'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            {status === 'all' ? 'Todos' : status === 'published' ? 'Publicados' : 'Rascunhos'}
                            <span className="ml-2 opacity-50">
                                ({status === 'all' ? posts.length : posts.filter(p => p.status === status).length})
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Buscar por título ou slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-app border border-app rounded-xl pl-10 pr-4 py-2 text-xs text-primary outline-none focus:border-link/50 transition-all focus:bg-surface/30"
                    />
                </div>
            </div>

            {/* List Table Area */}
            <div className="bg-surface rounded-2xl border border-app shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-[#0037680a] border-b border-app">
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Conteúdo</th>
                                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Categoria</th>
                                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Status & Data</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-app/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            {post.coverImageUrl ? (
                                                <img
                                                    src={post.coverImageUrl}
                                                    alt=""
                                                    className="w-12 h-12 rounded-lg object-cover border border-app shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-app/50 border border-app flex items-center justify-center text-secondary/30">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <Link
                                                    href={`/admin/posts/${post.id}`}
                                                    className="font-bold text-primary group-hover:text-link cursor-pointer transition-colors line-clamp-1"
                                                >
                                                    {post.title}
                                                </Link>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-secondary font-mono bg-app/50 px-1.5 py-0.5 rounded border border-app">/{post.slug}</span>
                                                    {(post.title_ja || post.content_ja) && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                                                            <Globe className="w-2.5 h-2.5" /> JP
                                                        </span>
                                                    )}
                                                    {(post.title_en || post.content_en) && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                                                            <Globe className="w-2.5 h-2.5" /> EN
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Mobile Metadata */}
                                                <div className="flex flex-wrap items-center gap-2 mt-2 md:hidden">
                                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-link/10 text-link px-2 py-0.5 rounded-full border border-link/10 scale-90 origin-left">
                                                        {post.categoryKey}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${post.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                    </span>
                                                    <span className="text-[10px] text-secondary/60">
                                                        • {new Date(post.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-5">
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-link/10 text-link px-2.5 py-1 rounded-full border border-link/10">
                                            {post.categoryKey}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${post.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                            </span>
                                            <span className="text-[11px] text-secondary/60 mt-0.5">
                                                {new Date(post.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right bg-surface/50 md:bg-transparent">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity translate-x-0 md:translate-x-2 md:group-hover:translate-x-0 transition-transform">
                                            <Link
                                                href={`/admin/posts/${post.id}`}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-link/10 text-link hover:bg-link hover:text-white transition-all"
                                                title="Editar post"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(post.id, post.title)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all"
                                                title="Excluir post"
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

                {filteredPosts.length === 0 && !loading && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-app rounded-full flex items-center justify-center mx-auto border border-app">
                            <Search className="w-8 h-8 text-secondary/20" />
                        </div>
                        <p className="text-secondary font-medium">Nenhum post encontrado para os filtros selecionados.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="text-link text-sm font-bold hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}

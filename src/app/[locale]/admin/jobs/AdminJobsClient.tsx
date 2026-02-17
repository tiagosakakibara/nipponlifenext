"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, MapPin, Briefcase, Loader2, Star, ChevronRight, ShieldAlert } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAdminJobs } from './hooks/useAdminJobs';
import { usePermission } from '../hooks/usePermission';
import { useTranslations } from 'next-intl';

export default function AdminJobsClient() {
    const t = useTranslations('admin');
    const router = useRouter();
    const { hasAccess, loading: permissionLoading } = usePermission('jobs');
    const {
        jobs,
        loading,
        page,
        setPage,
        totalPages,
        fetchJobs,
        deleteJob
    } = useAdminJobs();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (hasAccess) {
            const debounceTimer = setTimeout(() => {
                fetchJobs(page, searchTerm);
            }, 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [page, searchTerm, fetchJobs, hasAccess]);

    if (permissionLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
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
                    Você não tem permissão para acessar o gerenciamento de vagas.
                    Entre em contato com um administrador se acredita que isso é um erro.
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">Vagas de Emprego</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">Gerencie oportunidades de carreira e listagens</p>
                </div>
                <Link
                    href="/admin/jobs/new"
                    className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] group w-fit"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    POSTAR NOVA VAGA
                </Link>
            </div>

            {/* Filters Area */}
            <div className="bg-surface rounded-3xl border border-app shadow-sm overflow-hidden">
                <div className="p-6 border-b border-app bg-[#0037680a] flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 group-focus-within:text-link transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por título ou empresa..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-app rounded-2xl text-sm text-primary placeholder:text-secondary/30 outline-none focus:border-link/50 focus:ring-4 focus:ring-link/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#00376805] text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app">
                            <tr>
                                <th className="px-6 py-5 whitespace-nowrap">Oportunidade</th>
                                <th className="px-6 py-5 whitespace-nowrap">Empresa</th>
                                <th className="px-6 py-5 whitespace-nowrap">Localização</th>
                                <th className="px-6 py-5 whitespace-nowrap text-center">Status</th>
                                <th className="px-6 py-5 whitespace-nowrap text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-link animate-spin" />
                                            <span className="text-secondary/50 font-bold uppercase tracking-widest text-[10px]">Carregando vagas...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-secondary/40 italic">
                                        Nenhuma vaga encontrada.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-[#00376805] group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 flex-shrink-0">
                                                    {job.logo ? (
                                                        <img
                                                            src={job.logo}
                                                            alt={job.title}
                                                            className="w-full h-full rounded-xl object-cover border border-app shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-xl bg-app flex items-center justify-center text-secondary/20">
                                                            <Briefcase className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    {job.featured && (
                                                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-lg border-2 border-white">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col max-w-[200px] md:max-w-xs">
                                                    <span className="font-bold text-primary group-hover:text-link transition-colors truncate">
                                                        {job.title}
                                                    </span>
                                                    <span className="text-[10px] text-secondary/40 font-mono tracking-tighter">
                                                        {job.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary/80">
                                                <Building2 className="w-3.5 h-3.5 text-link" />
                                                {job.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary">
                                                <MapPin className="w-3.5 h-3.5 text-link" />
                                                {job.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${job.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_-5px_#10b98155]'
                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                }`}>
                                                {job.status === 'published' ? 'PUBLICADO' : 'RASCUNHO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 translate-x-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all">
                                                <Link
                                                    href={`/admin/jobs/${job.id}`}
                                                    className="p-2.5 text-secondary hover:text-link hover:bg-link/10 rounded-xl transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteJob(job.id)}
                                                    className="p-2.5 text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-app flex items-center justify-between bg-[#00376802]">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-app rounded-xl text-xs font-bold text-primary disabled:opacity-30 hover:bg-app transition-all shadow-sm"
                        >
                            ANTERIOR
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === i + 1
                                        ? 'bg-[#5593C3] text-white shadow-lg'
                                        : 'text-secondary hover:bg-app'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-app rounded-xl text-xs font-bold text-primary disabled:opacity-30 hover:bg-app transition-all shadow-sm"
                        >
                            PRÓXIMO
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

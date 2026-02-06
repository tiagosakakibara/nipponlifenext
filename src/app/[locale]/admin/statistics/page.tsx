"use client";

import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useTranslations } from 'next-intl';
import {
    BarChart3,
    Loader2,
    TrendingUp,
    Users,
    FileText,
    Building2,
    Briefcase,
    Calendar,
    MessageSquare,
    Eye,
    ArrowUpRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ActivityChart = dynamic(() => import('../components/DashboardCharts').then(mod => ({ default: mod.ActivityChart })), {
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-link" /></div>,
    ssr: false
});

export default function AdminStatisticsPage() {
    const { kpis, charts, loading, error } = useAdminDashboard();
    const t = useTranslations();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-link" />
                    <p className="text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !kpis) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
                <p className="font-bold text-lg">{t('admin.dashboardError')}</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-link" />
                    {t('admin.menu.statistics')}
                </h1>
                <p className="text-secondary text-sm mt-1">Análise detalhada de performance e engajamento</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Views</p>
                            <h3 className="text-3xl font-black text-primary">
                                {(
                                    kpis.views.news +
                                    kpis.views.community +
                                    kpis.views.questions +
                                    kpis.views.jobs +
                                    kpis.views.events +
                                    kpis.views.business +
                                    kpis.views.guides +
                                    kpis.views.gallery
                                ).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-link/10 rounded-xl">
                            <Eye className="w-6 h-6 text-link" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2">Novos Usuários</p>
                            <h3 className="text-3xl font-black text-primary">{kpis.newUsers}</h3>
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                Últimos 7 dias
                            </span>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2">Novos Posts</p>
                            <h3 className="text-3xl font-black text-primary">{kpis.recentPosts}</h3>
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                Esta semana
                            </span>
                        </div>
                        <div className="p-3 bg-[#5593C3]/10 rounded-xl">
                            <FileText className="w-6 h-6 text-[#5593C3]" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2">Novas Vagas</p>
                            <h3 className="text-3xl font-black text-primary">{kpis.recentJobs}</h3>
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                Esta semana
                            </span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Briefcase className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Atividade Recente (14 dias)</h3>
                <div className="h-[400px]">
                    <ActivityChart data={charts} />
                </div>
            </div>

            {/* Content Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Views by Category */}
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Visualizações por Categoria</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Notícias', value: kpis.views.news, color: 'bg-[#5593C3]', icon: FileText },
                            { label: 'Comunidade', value: kpis.views.community + kpis.views.questions, color: 'bg-pink-500', icon: MessageSquare },
                            { label: 'Vagas', value: kpis.views.jobs, color: 'bg-emerald-500', icon: Briefcase },
                            { label: 'Eventos', value: kpis.views.events, color: 'bg-amber-500', icon: Calendar },
                            { label: 'Negócios', value: kpis.views.business, color: 'bg-indigo-500', icon: Building2 },
                        ].sort((a, b) => b.value - a.value).map((item, index) => (
                            <div key={index} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="w-4 h-4 text-secondary" />
                                        <span className="text-sm font-bold text-primary">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-primary">{item.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-app rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${Math.max((item.value / (kpis.views.news + kpis.views.community + kpis.views.questions + kpis.views.jobs + kpis.views.events + kpis.views.business + 1)) * 100, 2)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Distribution */}
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Distribuição de Conteúdo</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-app/50 border border-app flex flex-col items-center justify-center text-center">
                            <FileText className="w-8 h-8 text-[#5593C3] mb-3" />
                            <span className="text-2xl font-black text-primary block">{kpis.totalPosts}</span>
                            <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Notícias Publicadas</span>
                        </div>
                        <div className="p-4 rounded-xl bg-app/50 border border-app flex flex-col items-center justify-center text-center">
                            <Briefcase className="w-8 h-8 text-emerald-500 mb-3" />
                            <span className="text-2xl font-black text-primary block">{kpis.totalJobs}</span>
                            <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Vagas Ativas</span>
                        </div>
                        <div className="p-4 rounded-xl bg-app/50 border border-app flex flex-col items-center justify-center text-center">
                            <Building2 className="w-8 h-8 text-indigo-500 mb-3" />
                            <span className="text-2xl font-black text-primary block">{kpis.totalBusinesses}</span>
                            <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Empresas Cadastradas</span>
                        </div>
                        <div className="p-4 rounded-xl bg-app/50 border border-app flex flex-col items-center justify-center text-center">
                            <Calendar className="w-8 h-8 text-amber-500 mb-3" />
                            <span className="text-2xl font-black text-primary block">{kpis.upcomingEvents}</span>
                            <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Eventos Futuros</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

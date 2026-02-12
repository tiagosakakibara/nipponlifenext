"use client";

import { useAdminDashboard } from './hooks/useAdminDashboard';
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import {
    FileText,
    Calendar,
    Briefcase,
    Building2,
    MessageSquare,
    Loader2,
    Clock,
    UserPlus,
    ArrowUpRight,
    TrendingUp,
    Eye,
    Camera
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';

const ActivityChart = dynamic(() => import('./components/DashboardCharts').then(mod => ({ default: mod.ActivityChart })), {
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-link" /></div>,
    ssr: false
});

export default function AdminDashboardPage() {
    const { kpis, charts, lists, loading, error } = useAdminDashboard();
    const t = useTranslations();
    const router = useRouter();
    const currentLocale = useLocale();
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // Map next-intl locale (pt/en/ja) to browser locale format (pt-BR/en-US/ja-JP)
    const localeMap: Record<string, string> = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'ja': 'ja-JP'
    };
    const locale = localeMap[currentLocale] || 'pt-BR';

    useEffect(() => {
        setLastUpdate(new Date().toLocaleTimeString(locale));
    }, [locale]);

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

    const stats = [
        {
            label: t('admin.totalPosts'),
            value: kpis.totalPosts,
            subValue: `+${kpis.recentPosts} ${t('admin.thisWeek')}`,
            icon: FileText,
            color: 'text-[#5593C3]',
            bg: 'bg-[#5593C3]/10',
            path: '/admin/posts'
        },
        {
            label: t('admin.totalJobs'),
            value: kpis.totalJobs,
            subValue: `+${kpis.recentJobs} ${t('admin.thisWeek')}`,
            icon: Briefcase,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            path: '/admin/jobs'
        },
        {
            label: t('admin.newUsers'),
            value: kpis.newUsers,
            subValue: t('admin.last7Days'),
            icon: UserPlus,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            path: '/admin/users'
        },
        {
            label: t('admin.futureEvents'),
            value: kpis.upcomingEvents,
            subValue: t('admin.scheduled'),
            icon: Calendar,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            path: '/admin/events'
        },
        {
            label: t('admin.totalBusinesses'),
            value: kpis.totalBusinesses,
            icon: Building2,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            path: '/admin/business'
        },
        {
            label: t('admin.totalCommunityQuestions'),
            value: kpis.recentCommunityPosts,
            subValue: t('admin.new7Days'),
            icon: MessageSquare,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
            path: '/admin/comunidade/posts'
        },
        {
            label: t('admin.menu.gallery'),
            value: '📸',
            subValue: 'Gerenciar álbuns',
            icon: Camera,
            color: 'text-[#D70F24]',
            bg: 'bg-[#D70F24]/10',
            path: '/admin/gallery'
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{t('admin.dashboard')}</h1>
                    <div className="flex items-center gap-2 text-secondary text-[10px] md:text-sm mt-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-link" />
                        <span>{t('admin.lastUpdateLabel')}: {lastUpdate || '--:--:--'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-surface px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-app shadow-sm self-start sm:self-auto">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">Performance: Normal</span>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.path}
                        className="bg-surface p-4 md:p-6 rounded-2xl border border-app shadow-sm flex items-center justify-between hover:shadow-2xl hover:shadow-link/10 transition-all hover:-translate-y-1 group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <p className="text-secondary text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1 md:mb-2 group-hover:text-link transition-colors">{stat.label}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tighter">{stat.value}</h3>
                            {stat.subValue && (
                                <div className="inline-flex items-center gap-1 mt-2 md:mt-3 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                    <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                                    <span className="text-[9px] md:text-[10px] font-extrabold text-emerald-500">{stat.subValue}</span>
                                </div>
                            )}
                        </div>
                        <div className={`p-3 md:p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform shadow-inner`}>
                            <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
                        </div>
                        {/* Abstract Background Decoration */}
                        <div className={`absolute -right-4 -bottom-4 w-16 md:w-24 h-16 md:h-24 rounded-full ${stat.bg} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                    </Link>
                ))}
            </div>

            {/* View Counts Table */}
            <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 md:p-2 bg-link/10 rounded-lg">
                        <Eye className="w-4 h-4 md:w-5 md:h-5 text-link" />
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-black text-primary uppercase tracking-widest">Controle de Visualizações (Real)</h3>
                        <p className="text-[8px] md:text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">Métricas de engajamento</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-app">
                                <th className="pb-4 text-[10px] font-black text-secondary uppercase tracking-widest">Setor</th>
                                <th className="pb-4 text-[10px] font-black text-secondary uppercase tracking-widest text-right">Visualizações Totais</th>
                                <th className="pb-4 text-[10px] font-black text-secondary uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            <tr
                                onClick={() => router.push('/admin/posts')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#5593C3]" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Notícias</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.news.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right">
                                    <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/comunidade/posts')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Blog</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.community.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right">
                                    <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/comunidade/posts')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-400" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Dúvidas</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.questions.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[9px] font-black text-emerald-500 uppercase">
                                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/jobs')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Vagas</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.jobs.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[9px] font-black text-emerald-500 uppercase">
                                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/events')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Eventos</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.events.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[9px] font-black text-emerald-500 uppercase">
                                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/business')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Negócios</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.business.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[9px] font-black text-emerald-500 uppercase">
                                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                            <tr
                                onClick={() => router.push('/admin/guides')}
                                className="group hover:bg-app/80 transition-all cursor-pointer"
                            >
                                <td className="py-3 md:py-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#D70F24]" />
                                        <span className="text-[10px] md:text-xs font-bold text-primary uppercase group-hover:text-link transition-colors">Guias</span>
                                    </div>
                                </td>
                                <td className="py-3 md:py-4 text-right font-black text-primary text-xs md:text-sm tabular-nums group-hover:scale-105 transition-transform">{kpis.views.guides.toLocaleString()}</td>
                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[9px] font-black text-emerald-500 uppercase">
                                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">Ativo</span>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-app">
                                <td className="py-4 text-[10px] font-black text-secondary uppercase">Total Geral</td>
                                <td className="py-4 text-right font-black text-link text-lg tabular-nums">
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
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-primary">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <ActivityChart data={charts} />
                </div>

                {/* Right Column: Mini Lists */}
                <div className="space-y-6">
                    {/* Upcoming Events List */}
                    <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm group">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                {t('admin.upcomingEvents')}
                            </h3>
                            <Link href="/admin/events" className="text-[10px] font-black text-link hover:underline uppercase tracking-widest">Ver Tudo</Link>
                        </div>
                        <div className="space-y-4">
                            {lists?.upcomingEvents.length === 0 ? (
                                <div className="py-8 text-center border-2 border-dashed border-app rounded-xl">
                                    <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">{t('admin.noUpcomingEvents')}</p>
                                </div>
                            ) : (
                                lists?.upcomingEvents.map(event => (
                                    <Link key={event.id} href={`/admin/events/${event.id}`} className="group/item block transition-all hover:translate-x-1">
                                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-app/50 transition-colors border border-transparent hover:border-app">
                                            <div className="bg-amber-500/10 text-amber-500 rounded-lg px-2 py-1.5 text-center min-w-[3.5rem] border border-amber-500/10 shadow-sm">
                                                <span className="block text-[8px] font-black uppercase tracking-tighter">{new Date(event.date).toLocaleDateString(locale, { month: 'short' })}</span>
                                                <span className="block text-xl font-black leading-none">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-primary text-sm line-clamp-1 group-hover/item:text-link transition-colors">{event.title}</h4>
                                                <p className="text-[10px] text-secondary/60 flex items-center gap-1 mt-1 font-bold">
                                                    <Clock className="w-3 h-3 text-link" />
                                                    {new Date(event.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Posts List */}
                    <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="w-4 h-4 text-link" />
                                {t('admin.recentPosts')}
                            </h3>
                            <Link href="/admin/posts" className="text-[10px] font-black text-link hover:underline uppercase tracking-widest">Ver Tudo</Link>
                        </div>
                        <div className="space-y-2">
                            {lists?.recentPosts.length === 0 ? (
                                <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest text-center py-4">{t('admin.noRecentPosts')}</p>
                            ) : (
                                lists?.recentPosts.map(post => (
                                    <Link key={post.id} href={`/admin/posts/${post.id}`} className="group/item block">
                                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-app/50 transition-all border border-transparent hover:border-app">
                                            <div className="min-w-0 flex-1 pr-4">
                                                <h4 className="text-xs font-bold text-primary line-clamp-1 group-hover/item:text-link transition-colors uppercase tracking-tight">{post.title}</h4>
                                                <p className="text-[10px] text-secondary/40 font-bold mt-0.5">
                                                    {new Date(post.date).toLocaleDateString(locale)}
                                                </p>
                                            </div>
                                            <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full border ${post.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                                                : 'bg-secondary/10 text-secondary border-secondary/10'
                                                }`}>
                                                {post.status === 'published' ? t('admin.published_short') : t('admin.draft_short')}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Community Activity */}
                    <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-pink-500" />
                                Comunidade
                            </h3>
                            <Link href="/admin/comunidade/posts" className="text-[10px] font-black text-link hover:underline uppercase tracking-widest">Ver Tudo</Link>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {lists?.recentCommunityQuestions.length === 0 ? (
                                <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest text-center py-4">Nenhuma atividade recente</p>
                            ) : (
                                lists?.recentCommunityQuestions.slice(0, 3).map(question => (
                                    <Link
                                        key={question.id}
                                        href="/admin/comunidade/posts"
                                        className="group/item block transition-all hover:translate-x-1"
                                    >
                                        <div className="p-3 bg-app/30 rounded-xl border border-app/50 group-hover/item:border-pink-500/30 group-hover/item:bg-pink-500/5 transition-all shadow-sm">
                                            <p className="text-[10px] font-bold text-pink-500 uppercase mb-1">Dúvida Recente</p>
                                            <h4 className="text-xs font-bold text-primary line-clamp-1 uppercase mb-1 group-hover/item:text-pink-500 transition-colors">{question.title}</h4>
                                            <div className="flex items-center justify-between text-[9px] text-secondary/60 font-black">
                                                <span>@{question.author}</span>
                                                <span>{new Date(question.date).toLocaleDateString(locale)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

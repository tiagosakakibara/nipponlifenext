'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { adminStatisticsService, CompleteStatisticsData } from '@/lib/adminStatisticsService';
import { Users, Globe, Coins, ArrowRight, TrendingUp, RefreshCw, Home, Utensils, Bus, Wallet, MessageSquare } from 'lucide-react';
import JapanChoroplethMap from '@/components/JapanChoroplethMap';
import { TourismVisualCard } from '@/components/TourismVisualCard';
import { communityCostOfLivingService } from '@/lib/communityCostOfLivingService';
import { getPrefectureLabel } from '@/constants/prefectures';

const COUNTRY_CODES: Record<string, string> = {
    "China": "cn",
    "Vietnam": "vn",
    "Vietnã": "vn",
    "South Korea": "kr",
    "Coreia do Sul": "kr",
    "Coreia (South Korea)": "kr",
    "Philippines": "ph",
    "Filipinas": "ph",
    "Brazil": "br",
    "Brasil": "br",
    "Nepal": "np",
    "Indonesia": "id",
    "Indonésia": "id",
    "Myanmar": "mm",
    "United States": "us",
    "Estados Unidos": "us",
    "Taiwan": "tw",
    "Thailand": "th",
    "Tailândia": "th",
    "Hong Kong": "hk",
    "Singapore": "sg",
    "Singapura": "sg",
    "Malaysia": "my",
    "Malásia": "my",
    "Australia": "au",
    "Austrália": "au",
    "Canada": "ca",
    "Canadá": "ca",
    "United Kingdom": "gb",
    "Reino Unido": "gb",
    "Germany": "de",
    "Alemanha": "de",
    "France": "fr",
    "França": "fr",
    "Italy": "it",
    "Itália": "it",
    "Spain": "es",
    "Espanha": "es"
};

const getCountryFlag = (name: string) => {
    // Exact match first
    let code = COUNTRY_CODES[name];

    // If no exact match, try to find a key within the name (useful for combined names like "Coreia (South Korea)")
    if (!code) {
        const key = Object.keys(COUNTRY_CODES).find(k => name.includes(k));
        if (key) code = COUNTRY_CODES[key];
    }

    if (!code) return null;
    return (
        <img
            src={`https://flagcdn.com/w40/${code}.png`}
            alt={name}
            className="w-5 h-auto rounded-[2px] shadow-sm border border-slate-200/50 dark:border-white/10"
        />
    );
};

export default function StatisticsPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CompleteStatisticsData | null>(null);
    const [salaryTab, setSalaryTab] = useState<'official' | 'community'>('community');
    const [prefectureStats, setPrefectureStats] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [recentNotes, setRecentNotes] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch main data first to prioritize critical content
                const statsData = await adminStatisticsService.getCompleteStatistics();

                if (!statsData) {
                    throw new Error('No active statistics snapshot found.');
                }

                setData(statsData);

                // Fetch secondary data independently so they don't block the main page
                try {
                    const [prefStats, catStats, notes] = await Promise.all([
                        communityCostOfLivingService.fetchCommunityStats(),
                        communityCostOfLivingService.fetchCommunityCategoryStats(),
                        communityCostOfLivingService.fetchRecentNotes(6)
                    ]);
                    setPrefectureStats(prefStats);
                    setCategoryStats(catStats);
                    setRecentNotes(notes);
                } catch (secondaryError) {
                    console.error('Error fetching secondary stats:', secondaryError);
                    // Don't fail the whole page if secondary data fails
                }
            } catch (err: any) {
                console.error('Error fetching statistics:', err);
                setError(err.message || 'Failed to load statistics data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-app flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
                <div className="bg-surface p-8 rounded-2xl shadow-lg border border-app text-center max-w-md">
                    <TrendingUp className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary mb-2">Unavailable</h3>
                    <p className="text-muted mb-6">{error || t('home.sections.statistics')}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-accent text-white rounded-xl font-bold hover:bg-accent-dark transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { snapshot, kpis, topNationalities, salaryComparison, tourism, prefectureDensity } = data;

    const getIconForKey = (key: string) => {
        const lower = key.toLowerCase();
        if (lower.includes('estrangeiro') || lower.includes('foreign') || lower.includes('popula')) return <Users size={24} />;
        if (lower.includes('nacionalidade') || lower.includes('countr') || lower.includes('cidadania') || lower.includes('mundo')) return <Globe size={24} />;
        if (lower.includes('salário') || lower.includes('salary') || lower.includes('wage') || lower.includes('income')) return <Coins size={24} />;
        return <TrendingUp size={24} />;
    };

    // Use the first 3 KPIs from the database, or fill with placeholders if empty
    // Using keys from messages/pt.json: statistics.kpis.totalForeigners.title etc.
    const displayKpis = kpis.length > 0 ? kpis.slice(0, 3) : [
        { id: '1', key: 'total_foreigners', value_numeric: 0, delta_text: null, display_prefix: null },
        { id: '2', key: 'nationalities', value_numeric: 0, delta_text: null, display_prefix: null },
        { id: '3', key: 'avg_salary_national', value_numeric: 0, delta_text: null, display_prefix: '¥' }
    ];

    return (
        <main className="min-h-screen bg-app pb-20">
            {/* 1. HERO SECTION */}
            <section className="pt-16 pb-12 px-4 md:px-8 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-surface text-muted font-bold text-xs tracking-wider mb-6 shadow-sm border border-app">
                    {t('statistics.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight leading-tight">
                    {t('statistics.hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
                    {t('statistics.hero.subtitle')}
                </p>
            </section>

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
                {/* 2. KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {displayKpis.map((kpi, index) => (
                        <div key={index} className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-app hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-app rounded-xl flex items-center justify-center mb-6 text-primary/80">
                                {/* Use optional chain or fallback for key which might be translated string */}
                                {getIconForKey(kpi.key)}
                            </div>
                            <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                                {kpi.key === 'total_foreigners' ? t('statistics.kpis.totalForeigners.title') :
                                    kpi.key === 'nationalities' ? t('statistics.kpis.nationalities.title') :
                                        kpi.key === 'avg_salary_national' ? t('statistics.kpis.avgSalary.title') :
                                            // Fallback if key is already translated or custom
                                            kpi.key}
                            </p>
                            <h3 className="text-4xl font-black text-primary mb-3">
                                {kpi.display_prefix}{kpi.value_numeric.toLocaleString()}
                            </h3>
                            {kpi.delta_text && (
                                <div className="flex items-center text-green-500 font-bold text-sm bg-green-500/10 w-fit px-2 py-1 rounded-md">
                                    <TrendingUp size={14} className="mr-1.5" />
                                    {kpi.delta_text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 3. MAIN DATA BLOCK */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* LEFT: Top Nationalities */}
                    <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-sm border border-app flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent"></div>
                                <h2 className="text-xl md:text-2xl font-bold text-primary">
                                    {t('statistics.topNationalities.title')}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {topNationalities.map((item, index) => (
                                <div key={item.id || index} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-primary flex items-center gap-2">
                                            {getCountryFlag(item.nationality_label)} {item.nationality_label}
                                        </span>
                                        <span className="text-sm font-medium text-muted">
                                            {item.value_numeric.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-200/20 dark:bg-white/5 rounded-full overflow-hidden border border-primary/10">
                                        <div
                                            className="h-full bg-blue-600/60 group-hover:bg-blue-600/80 rounded-full transition-all duration-1000"
                                            style={{ width: `${(item.value_numeric / topNationalities[0].value_numeric) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Regional Distribution (Real Map) */}
                    <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-sm border border-app relative overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <h2 className="text-xl md:text-2xl font-bold text-primary">
                                    {t('statistics.regionalDistribution.title')}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted">
                                <span>{t('statistics.regionalDistribution.title')}</span>
                            </div>
                        </div>

                        {/* Map Visualization */}
                        <div className="flex-1 relative bg-app rounded-2xl flex items-center justify-center border border-dashed border-app overflow-hidden">
                            <JapanChoroplethMap data={prefectureDensity} />
                        </div>
                    </div>
                </div>

                {/* 4. BOTTOM SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* LEFT: Salary Comparison */}
                    <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-sm border border-app">
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
                                {t('statistics.salaryComparison.title')}
                            </h2>
                            <p className="text-secondary font-medium text-sm md:text-base">
                                {t('statistics.salaryComparison.subtitle')}
                            </p>
                        </div>

                        <div className="flex p-1 bg-app rounded-xl mb-8 w-fit">
                            <button
                                onClick={() => setSalaryTab('official')}
                                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${salaryTab === 'official' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                            >
                                {t('statistics.salaryComparison.tabs.official')}
                            </button>
                            <button
                                onClick={() => setSalaryTab('community')}
                                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${salaryTab === 'community' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                            >
                                {t('statistics.salaryComparison.tabs.community')}
                            </button>
                        </div>

                        <div className="bg-app rounded-2xl p-6 md:p-8 border border-app min-h-[200px] flex flex-col justify-center relative overflow-hidden">
                            {salaryTab === 'official' ? (
                                <div className="flex flex-col items-center justify-center text-center opacity-60">
                                    <span className="bg-yellow-100/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                                        {t('statistics.salaryComparison.officialBadge')}
                                    </span>
                                    <p className="text-sm font-semibold text-muted">
                                        {salaryComparison?.official_note || '...'}
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full overflow-y-auto custom-scrollbar pr-2">
                                    <div className="flex justify-between items-end mb-4 sticky top-0 bg-app pb-2 z-10 border-b border-white/5">
                                        <h3 className="text-xl font-bold text-primary">Top 10</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {categoryStats.length === 0 ? (
                                            <p className="text-muted text-sm flex flex-col items-center justify-center h-32">
                                                <span>No contributions</span>
                                                <Link href="/contribute/cost-of-living" className="text-blue-500 hover:underline mt-2">Contribute</Link>
                                            </p>
                                        ) : (
                                            categoryStats.map((stat, idx) => (
                                                <div key={stat.job_category} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-app hover:border-blue-500/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-primary">
                                                                {/* Translating job category if possible, else showing key */}
                                                                {t(`community.costOfLiving.jobCategories.${stat.job_category}`) || stat.job_category}
                                                            </p>
                                                            <p className="text-[10px] text-muted">{stat.contributions} entries</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-sm text-primary">¥{stat.avg_monthly_net_income.toLocaleString()}</p>
                                                        <p className="text-[10px] text-muted">Monthly</p>
                                                    </div>
                                                    <div className="text-right pl-4 border-l border-app/50 ml-2">
                                                        <p className="font-bold text-sm text-accent">¥{stat.avg_hourly_wage.toLocaleString()}</p>
                                                        <p className="text-[10px] text-muted">Hourly</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-app text-center">
                                        <Link href="/contribute/cost-of-living" className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider flex items-center justify-center gap-1">
                                            Contribute <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: CTA Matches Original */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 md:p-10 shadow-lg text-white flex flex-col justify-center relative overflow-hidden group">
                        {/* Simplified CTA as original text keys are not in provided pt.json except generic ones */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                                {t('community.costOfLiving.title')}
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-md">
                                {t('community.costOfLiving.subtitle')}
                            </p>
                            <Link href="/contribute/cost-of-living" className="bg-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:scale-105 hover:shadow-xl flex items-center gap-2 w-fit group">
                                {t('community.costOfLiving.submit')}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 5. COMMUNITY EXPENSES SECTION */}
                <div className="mt-12 bg-surface rounded-3xl p-6 md:p-10 shadow-sm border border-app">
                    <div className="mb-10 text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold tracking-wider uppercase mb-4">
                            <Wallet size={12} />
                            real cost of living
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary mb-4">
                            {t('community.costOfLiving.sectionExpenses')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prefectureStats.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-50 italic">
                                {t('common.noResults')}
                            </div>
                        ) : (
                            prefectureStats.slice(0, 9).map((stat) => (
                                <div key={stat.prefecture_code} className="bg-app rounded-2xl p-6 border border-app hover:border-blue-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-black text-primary">{getPrefectureLabel(stat.prefecture_code, locale as any)}</h3>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">{stat.contributions} entries</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-accent">¥{stat.avg_monthly_essential_cost.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Total Est.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Rent */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-blue-500 shrink-0">
                                                <Home size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="font-bold text-muted uppercase tracking-tighter">Rent</span>
                                                    <span className="font-black text-primary">¥{stat.avg_rent.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${(stat.avg_rent / stat.avg_monthly_essential_cost) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Food */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-green-500 shrink-0">
                                                <Utensils size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="font-bold text-muted uppercase tracking-tighter">Food</span>
                                                    <span className="font-black text-primary">¥{stat.avg_food.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${(stat.avg_food / stat.avg_monthly_essential_cost) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transport */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-orange-500 shrink-0">
                                                <Bus size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="font-bold text-muted uppercase tracking-tighter">Transport</span>
                                                    <span className="font-black text-primary">¥{stat.avg_transport.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-orange-500 rounded-full"
                                                        style={{ width: `${(stat.avg_transport / stat.avg_monthly_essential_cost) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 6. COMMUNITY RECENT NOTES */}
                {recentNotes.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
                                    Community Notes
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentNotes.map((note, index) => (
                                <div
                                    key={index}
                                    className="bg-surface rounded-2xl p-6 border border-app shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
                                >
                                    <div className="flex-1">
                                        <div className="relative">
                                            <span className="text-4xl text-blue-500/10 absolute -top-4 -left-2 font-serif group-hover:text-blue-500/20 transition-colors">"</span>
                                            <p className="text-primary italic leading-relaxed relative z-10 text-sm md:text-base">
                                                {note.notes}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-app flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-black text-primary uppercase tracking-tighter">
                                                {t(`community.costOfLiving.jobCategories.${note.job_category}`) || note.job_category}
                                            </p>
                                            <p className="text-[10px] text-muted font-bold">
                                                {getPrefectureLabel(note.prefecture_code, locale as any)}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-muted font-bold bg-app px-2 py-1 rounded">
                                            {new Date(note.created_at).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. TOURISM SECTION - CONNECTED */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                        {/* LEFT: Visual Card */}
                        <TourismVisualCard year={snapshot.year} />

                        {/* RIGHT: Top Countries List */}
                        <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-sm border border-app flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    <h2 className="text-xl md:text-2xl font-bold text-primary">
                                        {t('statistics.tourism.title')}
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                                    {snapshot.year}
                                </span>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                {tourism.length === 0 ? (
                                    <p className="text-muted text-center py-10 italic">No tourism records yet.</p>
                                ) : (
                                    tourism.map((item) => (
                                        <div key={item.id} className="group flex items-center gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                                                {item.rank}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <span className="text-sm font-bold text-primary group-hover:text-blue-500 transition-colors flex items-center gap-2">
                                                        {getCountryFlag(item.country_name)} \
                                                        {t(`countries.${item.country_name}`) !== `countries.${item.country_name}` ? t(`countries.${item.country_name}`) : item.country_name}
                                                    </span>
                                                    <span className="text-sm font-semibold text-muted">
                                                        {item.visitor_label || (item.visitor_count > 0 ? (item.visitor_count / 1000).toFixed(0) + 'k' : '')}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-400/60 group-hover:bg-blue-500 rounded-full transition-all duration-700 ease-out"
                                                        style={{ width: `${(item.visitor_count / (tourism[0]?.visitor_count || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

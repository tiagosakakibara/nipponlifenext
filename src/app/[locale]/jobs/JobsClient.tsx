"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, MapPin, Briefcase, Eye, ArrowRight, X } from 'lucide-react';
import { jobsService } from '@/lib/jobsService';
import { Link } from '@/i18n/routing';
import type { Job } from '@/types/job';
import { ApplyForm } from './components/ApplyForm';

const ITEMS_PER_PAGE = 6;

export default function JobsClient() {
    const t = useTranslations('jobs');
    const ct = useTranslations('common');
    const searchParams = useSearchParams();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [activeChip, setActiveChip] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial state
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const data = await jobsService.getPublishedJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Handle initial job selection from URL
    useEffect(() => {
        const jobId = searchParams.get('selectedJobId');
        if (!loading && jobs.length > 0 && jobId) {
            const job = jobs.find(j => j.id === jobId);
            if (job) setSelectedJob(job);
        }
    }, [loading, jobs, searchParams]);

    const regions = [
        { key: 'all', label: t('regions.allRegions') },
        { key: 'aichi', label: t('regions.aichi') },
        { key: 'tokyo', label: t('regions.tokyo') },
        { key: 'osaka', label: t('regions.osaka') },
        { key: 'kanagawa', label: t('regions.kanagawa') },
        { key: 'shizuoka', label: t('regions.shizuoka') },
        { key: 'gunma', label: t('regions.gunma') },
        { key: 'saitama', label: t('regions.saitama') },
    ];

    const jobTypes = [
        { value: 'all', label: t('types.all') },
        { value: 'full-time', label: t('types.fullTime') },
        { value: 'part-time', label: t('types.partTime') },
        { value: 'contract', label: t('types.contract') },
        { value: 'temporary', label: t('types.temporary') },
    ];

    const chips = [
        { key: 'all', label: t('filters.all') },
        { key: 'accommodation', label: t('filters.withAccommodation') },
        { key: 'beginner', label: t('filters.beginnerOk') },
        { key: 'n4', label: t('filters.n4Plus') },
    ];

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matches = job.title.toLowerCase().includes(query) ||
                    job.company.toLowerCase().includes(query);
                if (!matches) return false;
            }

            if (selectedLocation !== 'all') {
                const region = regions.find(r => r.key === selectedLocation)?.label;
                if (region && !job.location.includes(region)) return false;
            }

            if (selectedType !== 'all' && job.type !== selectedType) return false;

            if (activeChip !== 'all') {
                const chipLabel = chips.find(c => c.key === activeChip)?.label.toLowerCase();
                if (chipLabel) {
                    const hasTag = job.tags.some(tag => tag.toLowerCase().includes(chipLabel));
                    if (!hasTag) return false;
                }
            }

            return true;
        });
    }, [jobs, searchQuery, selectedLocation, selectedType, activeChip]);

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Premium Design */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-zinc-100">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto md:mx-0">
                            <Briefcase className="w-3 h-3" />
                            {t('modal.careerOpportunity')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary tracking-tight leading-tight">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-secondary font-medium max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Search & Filter Bar */}
            <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-6 py-4 space-y-4">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-[#D70F24] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-11 pr-6 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary focus:bg-white focus:border-[#D70F24] transition-all outline-none"
                            />
                        </div>

                        {/* Location Select */}
                        <div className="w-full lg:w-48 relative">
                            <select
                                value={selectedLocation}
                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                className="w-full px-5 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-white focus:border-[#D70F24] transition-all outline-none"
                            >
                                {regions.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>

                        {/* Type Select */}
                        <div className="w-full lg:w-48 relative">
                            <select
                                value={selectedType}
                                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                                className="w-full px-5 py-3.5 bg-zinc-100/50 border border-zinc-100 rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-white focus:border-[#D70F24] transition-all outline-none"
                            >
                                {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {chips.map(chip => (
                            <button
                                key={chip.key}
                                onClick={() => { setActiveChip(chip.key); setCurrentPage(1); }}
                                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeChip === chip.key
                                    ? 'bg-[#D70F24] text-white shadow-lg shadow-red-500/20'
                                    : 'bg-zinc-100 text-muted hover:bg-zinc-200'
                                    }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Grid */}
            <main className="container mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        {loading ? t('loading') : t('jobsFound', { count: filteredJobs.length })}
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{t('loading')}</span>
                    </div>
                ) : paginatedJobs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedJobs.map((job) => (
                                <article
                                    key={job.id}
                                    onClick={() => { setSelectedJob(job); setShowApplyForm(false); }}
                                    className="group relative bg-white border border-zinc-100 rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* Accent Blur */}
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/5 blur-[80px] group-hover:bg-red-500/10 transition-all" />

                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            {job.logo ? (
                                                <img src={job.logo} className="w-14 h-14 rounded-2xl object-contain bg-zinc-50 p-2 shadow-sm" alt={job.company} />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                                {job.type}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xl font-heading font-bold text-primary group-hover:text-red-600 transition-colors leading-tight">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-muted text-[11px] font-bold uppercase tracking-wider">
                                                <span className="text-primary">{job.company}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {job.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {job.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-zinc-50 text-secondary rounded-lg text-[9px] font-bold uppercase tracking-widest border border-zinc-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{t('salary')}</p>
                                                <p className="text-lg font-black text-[#1a1a1a]">{job.salary}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-4 rounded-2xl bg-white border border-zinc-100 text-zinc-400 hover:text-[#1a1a1a] disabled:opacity-30 transition-all font-black text-xs"
                                >
                                    {ct('previous')}
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1
                                            ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                                            : 'bg-white border border-zinc-100 text-zinc-400 hover:text-[#1a1a1a]'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-4 rounded-2xl bg-white border border-zinc-100 text-zinc-400 hover:text-[#1a1a1a] disabled:opacity-30 transition-all font-black text-xs"
                                >
                                    {ct('next')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-100 rounded-[32px] flex items-center justify-center text-zinc-300">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1a1a1a]">{t('noJobsTitle')}</h3>
                        <p className="text-zinc-400 max-w-sm font-medium">{t('noJobsDescription')}</p>
                    </div>
                )}
            </main>

            {/* Premium Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div
                        className="absolute inset-0 bg-[#1a1a1a]/80 backdrop-blur-md animate-fade-in"
                        onClick={() => setSelectedJob(null)}
                    />
                    <div className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] animate-slide-up">
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-500"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Lead Section */}
                        <div className="w-full md:w-[40%] bg-zinc-50/50 p-12 flex flex-col justify-between border-r border-zinc-100">
                            <div className="space-y-8">
                                {selectedJob.logo && (
                                    <img src={selectedJob.logo} className="w-24 h-24 rounded-3xl object-contain bg-white p-4 shadow-xl shadow-zinc-200/50" alt={selectedJob.company} />
                                )}
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        {selectedJob.type}
                                    </div>
                                    <h2 className="text-4xl font-black text-[#1a1a1a] tracking-tight leading-tight">
                                        {selectedJob.title}
                                    </h2>
                                    <p className="text-xl font-bold text-zinc-400 mt-2 uppercase tracking-wide">{selectedJob.company}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Office Location</p>
                                            <p className="text-sm font-black text-[#1a1a1a]">{selectedJob.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Global Visibility</p>
                                            <p className="text-sm font-black text-[#1a1a1a]">{selectedJob.db_fields?.view_count || 0} Views</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!showApplyForm ? (
                                <button
                                    onClick={() => setShowApplyForm(true)}
                                    className="w-full bg-[#D70F24] hover:bg-[#b50d1f] text-white py-5 rounded-3xl font-black text-sm shadow-2xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {t('applyButton')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowApplyForm(false)}
                                    className="w-full bg-zinc-100 text-[#1a1a1a] py-5 rounded-3xl font-black text-sm transition-all"
                                >
                                    {ct('back')}
                                </button>
                            )}
                        </div>

                        {/* Modal Content Section */}
                        <div className="flex-1 p-12 overflow-y-auto">
                            {showApplyForm ? (
                                <ApplyForm
                                    jobTitle={selectedJob.title}
                                    onClose={() => { setSelectedJob(null); setShowApplyForm(false); }}
                                />
                            ) : (
                                <div className="space-y-12">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                                            <h3 className="text-xl font-heading font-bold text-primary tracking-tight uppercase">{t('modal.jobDescription')}</h3>
                                        </div>
                                        <div className="space-y-4 text-lg text-secondary font-medium leading-relaxed">
                                            {selectedJob.description?.map((p, i) => <p key={i}>{p}</p>)}
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-[#D70F24] rounded-full" />
                                            <h3 className="text-xl font-heading font-bold text-primary tracking-tight uppercase">{t('modal.requirements')}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedJob.requirements?.map((req, i) => (
                                                <div key={i} className="p-4 bg-zinc-50 flex items-start gap-3 rounded-2xl border border-zinc-100">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex-shrink-0 flex items-center justify-center mt-0.5">
                                                        <ChevronRight className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-sm font-bold text-primary leading-tight">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                            <h3 className="text-xl font-heading font-bold text-primary tracking-tight uppercase">{t('modal.benefits')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {selectedJob.benefits?.map((benefit: any, i) => (
                                                <div key={i} className="p-6 bg-white border border-zinc-100 rounded-3xl text-center space-y-2 hover:border-emerald-200 transition-colors">
                                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{benefit.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

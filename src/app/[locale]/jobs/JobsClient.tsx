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
        <div className="min-h-screen bg-app">
            {/* Hero Section - Premium Design */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-surface border-b border-app">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto md:mx-0">
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
            <section className="sticky top-20 z-30 bg-surface/80 backdrop-blur-xl border-b border-app shadow-sm transition-all duration-300">
                <div className="container mx-auto px-6 py-4 space-y-4">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-[#D70F24] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-11 pr-6 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
                            />
                        </div>

                        {/* Location Select */}
                        <div className="w-full lg:w-48 relative">
                            <select
                                value={selectedLocation}
                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                className="w-full px-5 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
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
                                className="w-full px-5 py-3.5 bg-app/50 border border-app rounded-2xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
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
                                    : 'bg-app text-muted hover:bg-zinc-200 dark:hover:bg-zinc-800'
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
                                    className="group relative bg-surface border border-app rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-56 w-full overflow-hidden bg-muted/30">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={job.company}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-app text-muted">
                                                <Briefcase className="w-12 h-12 opacity-50" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
                                            {/* Premium Badge - Only if featured */}
                                            {job.featured && (
                                                <span className="px-3 py-1 bg-[#D70F24] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md border border-white/10">
                                                    Premium
                                                </span>
                                            )}

                                            {/* Type Badge */}
                                            <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10 shadow-sm">
                                                {jobTypes.find(t => t.value === job.type)?.label || job.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-1">
                                        {/* Company Name */}
                                        <h3 className="text-xl font-black text-primary mb-2 line-clamp-1 group-hover:text-[#D70F24] transition-colors tracking-tight">
                                            {job.company}
                                        </h3>

                                        {/* Job Title / Description Excerpt */}
                                        <p className="text-sm font-medium text-secondary mb-6 line-clamp-2 flex-1">
                                            {job.title}
                                            {job.description && job.description.length > 0 && (
                                                <span className="font-normal opacity-80"> — {job.description[0]}</span>
                                            )}
                                        </p>

                                        {/* Location */}
                                        <div className="pt-4 border-t border-app mt-auto flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">{job.location}</span>
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
                                    className="p-4 rounded-2xl bg-surface border border-app text-zinc-400 hover:text-primary disabled:opacity-30 transition-all font-black text-xs"
                                >
                                    {ct('previous')}
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1
                                            ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                                            : 'bg-surface border border-app text-zinc-400 hover:text-primary'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-4 rounded-2xl bg-surface border border-app text-zinc-400 hover:text-primary disabled:opacity-30 transition-all font-black text-xs"
                                >
                                    {ct('next')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                        <div className="w-20 h-20 bg-app rounded-[32px] flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-primary">{t('noJobsTitle')}</h3>
                        <p className="text-secondary max-w-sm font-medium">{t('noJobsDescription')}</p>
                    </div>
                )}
            </main>

            {/* Premium Job Details Modal */}
            {/* Premium Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div
                        className="absolute inset-0 bg-[#1a1a1a]/80 backdrop-blur-md animate-fade-in"
                        onClick={() => setSelectedJob(null)}
                    />
                    <div className="relative w-full max-w-5xl bg-white dark:bg-[#0B1020] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] animate-slide-up border border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-2xl bg-white dark:bg-white/10 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-500 text-zinc-500 dark:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Lead Section */}
                        <div className="w-full md:w-[40%] bg-zinc-50 dark:bg-white/5 p-12 flex flex-col justify-between border-r border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-8">
                                {selectedJob.logo && (
                                    <img src={selectedJob.logo} className="w-24 h-24 rounded-3xl object-contain bg-white dark:bg-white/10 p-4 shadow-xl shadow-black/5" alt={selectedJob.company} />
                                )}
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        {selectedJob.type}
                                    </div>
                                    <h2 className="text-4xl font-black text-primary tracking-tight leading-tight">
                                        {selectedJob.title}
                                    </h2>
                                    <p className="text-xl font-bold text-secondary mt-2 uppercase tracking-wide">{selectedJob.company}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-red-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Office Location</p>
                                            <p className="text-sm font-black text-primary">{selectedJob.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-emerald-500">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Global Visibility</p>
                                            <p className="text-sm font-black text-primary">{selectedJob.db_fields?.view_count || 0} Views</p>
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
                                    className="w-full bg-white dark:bg-white/10 text-primary border border-zinc-100 dark:border-zinc-700 py-5 rounded-3xl font-black text-sm transition-all hover:bg-zinc-50 dark:hover:bg-white/20"
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
                                                <div key={i} className="p-4 bg-zinc-50 dark:bg-white/5 flex items-start gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
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
                                                <div key={i} className="p-6 bg-white dark:bg-white/5 border border-zinc-100 dark:border-zinc-800 rounded-3xl text-center space-y-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
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

"use client";

import { useState, useMemo, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, MapPin, Briefcase, Eye } from 'lucide-react';
import { jobsService } from '@/lib/jobsService';
import { Link } from '@/i18n/routing';
import type { Job } from '@/types/job';
import JobAccessButton from './JobAccessButton';

const ITEMS_PER_PAGE = 12;

export default function JobsClient() {
    const t = useTranslations('jobs');
    const ct = useTranslations('common');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
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

            return true;
        });
    }, [jobs, searchQuery, selectedLocation, selectedType]);

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-app">
            {/* Hero Section - Premium Design */}
            <section className="relative py-6 md:min-h-[230px] md:pt-20 overflow-hidden bg-surface border-b border-app">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="max-w-3xl space-y-3">
                        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto md:mx-0">
                            <Briefcase className="w-3 h-3" />
                            {t('modal.careerOpportunity')}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary tracking-tight leading-tight">
                            {t('title')}
                        </h1>
                        <p className="hidden md:block text-lg text-secondary font-medium max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>
                        <JobAccessButton />
                    </div>
                </div>
            </section>

            {/* Sticky Search & Filter Bar */}
            <section className="md:sticky md:top-20 z-30 bg-surface/80 backdrop-blur-xl border-b border-app shadow-sm transition-all duration-300">
                <div className="container mx-auto px-6 py-2 space-y-2">
                    <div className="flex flex-col lg:flex-row items-center gap-2">
                        {/* Search */}
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-[#D70F24] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-11 pr-6 py-2 bg-app/50 border border-app rounded-xl text-xs font-bold text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
                            />
                        </div>

                        {/* Location Select */}
                        <div className="w-full lg:w-48 relative">
                            <select
                                value={selectedLocation}
                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                className="w-full px-5 py-2 bg-app/50 border border-app rounded-xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
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
                                className="w-full px-5 py-2 bg-app/50 border border-app rounded-xl text-xs font-bold text-primary appearance-none focus:bg-surface focus:border-[#D70F24] transition-all outline-none"
                            >
                                {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/jobs/${job.id}`}
                                    className="group relative bg-surface border border-app rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-40 w-full overflow-hidden bg-muted/30">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={job.company}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-app text-muted">
                                                <Briefcase className="w-10 h-10 opacity-50" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-4">
                                            {/* Premium Badge - Only if featured */}
                                            {job.featured && (
                                                <span className="px-2 py-0.5 bg-[#D70F24] text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-md border border-white/10">
                                                    Premium
                                                </span>
                                            )}

                                            {/* Type Badge */}
                                            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-md border border-white/10 shadow-sm">
                                                {jobTypes.find(t => t.value === job.type)?.label || job.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 flex flex-col flex-1">
                                        {/* Company Name */}
                                        <h3 className="text-lg font-black text-primary mb-1 line-clamp-1 group-hover:text-[#D70F24] transition-colors tracking-tight">
                                            {job.company}
                                        </h3>

                                        {/* Job Title / Description Excerpt */}
                                        <p className="text-xs font-medium text-secondary mb-3 line-clamp-2 flex-1">
                                            {job.title}
                                            {job.description && job.description.length > 0 && (
                                                <span className="font-normal opacity-80"> — {job.description[0]}</span>
                                            )}
                                        </p>

                                        {/* Location */}
                                        <div className="pt-3 border-t border-app mt-auto flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                                            <MapPin className="w-3 h-3" />
                                            <span className="line-clamp-1">{job.location}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-2xl bg-surface border border-app text-zinc-400 hover:text-primary disabled:opacity-30 transition-all font-black text-xs"
                                >
                                    {ct('previous')}
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1
                                            ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                                            : 'bg-app border border-app text-zinc-400 hover:text-primary'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-2xl bg-surface border border-app text-zinc-400 hover:text-primary disabled:opacity-30 transition-all font-black text-xs"
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


        </div>
    );
}

"use client";

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Briefcase, Eye, ChevronRight, ChevronLeft, Calendar, Share2, Building, Clock } from 'lucide-react';
import { Job } from '@/types/job';
import { ApplyForm } from '../components/ApplyForm';
import { JobComments } from '../components/JobComments';

export default function JobDetailsClient({ job }: { job: Job }) {
    const t = useTranslations('jobs');
    const locale = useLocale();
    const [showApplyForm, setShowApplyForm] = useState(false);

    // Localized fields
    // Localized fields with fallback to default language if translation is missing or empty
    const title = (locale === 'ja' ? job.title_ja : locale === 'en' ? job.title_en : undefined) || job.title;

    const descriptionRaw = locale === 'ja' ? job.description_ja : locale === 'en' ? job.description_en : undefined;
    const description = (descriptionRaw && descriptionRaw.length > 0) ? descriptionRaw : job.description;

    const requirementsRaw = locale === 'ja' ? job.requirements_ja : locale === 'en' ? job.requirements_en : undefined;
    const requirements = (requirementsRaw && requirementsRaw.length > 0) ? requirementsRaw : job.requirements;

    const benefitsRaw = locale === 'ja' ? job.benefits_ja : locale === 'en' ? job.benefits_en : undefined;
    const benefits = (benefitsRaw && benefitsRaw.length > 0) ? benefitsRaw : job.benefits;

    const salary = (locale === 'ja' ? job.salary_ja : locale === 'en' ? job.salary_en : undefined) || job.salary;
    const bonus = (locale === 'ja' ? job.bonus_ja : locale === 'en' ? job.bonus_en : undefined) || job.bonus;
    const location = (locale === 'ja' ? job.location_ja : locale === 'en' ? job.location_en : undefined) || job.location;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: job.title,
                    text: `${job.title} at ${job.company}`,
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-app pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-surface border-b border-app">
                <div className="container mx-auto px-6 py-4">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t('back')}
                    </Link>
                </div>
            </div>

            {/* Hero / Title Section */}
            <div className="relative bg-surface border-b border-app overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {job.type}
                            </span>
                            {job.featured && (
                                <span className="px-3 py-1 bg-[#D70F24] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-red-500/20">
                                    Premium
                                </span>
                            )}
                            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider ml-auto">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight leading-tight mb-4">
                            {title}
                        </h1>
                        <div className="flex items-center gap-4 text-secondary md:text-xl font-bold">
                            <Building className="w-5 h-5 text-muted" />
                            <span className="uppercase tracking-wide">{job.company}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar (Left) */}
                    <aside className="w-full lg:w-[350px] space-y-8 shrink-0">
                        {/* Logo & Quick Stats */}
                        <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm">
                            {job.logo && (
                                <div className="mb-8">
                                    <img
                                        src={job.logo}
                                        alt={job.company}
                                        className="w-32 h-32 rounded-3xl object-contain bg-white border border-app p-4 shadow-xl shadow-black/5 mx-auto lg:mx-0"
                                    />
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-app/50 border border-app">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-red-500 border border-app shadow-sm">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Location</p>
                                        <p className="text-xs font-bold text-primary">{location}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-app/50 border border-app">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-emerald-500 border border-app shadow-sm">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Views</p>
                                        <p className="text-xs font-bold text-primary">{job.view_count || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-app/50 border border-app">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-blue-500 border border-app shadow-sm">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <div className="w-full">
                                        <button
                                            onClick={handleShare}
                                            className="w-full text-left"
                                        >
                                            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Share</p>
                                            <p className="text-xs font-bold text-primary truncate hover:text-blue-500 transition-colors">Share this job</p>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-app">
                                {!showApplyForm ? (
                                    <button
                                        onClick={() => setShowApplyForm(true)}
                                        className="w-full bg-[#D70F24] hover:bg-[#b50d1f] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {t('applyButton')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyForm(false)}
                                        className="w-full bg-surface text-primary border border-app py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-100 dark:hover:bg-white/10"
                                    >
                                        Cancel Application
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Salary & Bonus if available */}
                        {(salary || bonus) && (
                            <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden border border-zinc-600/50 shadow-lg">
                                <div className="relative z-10 space-y-6">
                                    {salary && (
                                        <div>
                                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{t('salary')}</p>
                                            <p className="text-xl font-bold">{salary}</p>
                                        </div>
                                    )}
                                    {bonus && (
                                        <div>
                                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{t('modal.bonus') || 'Bonus'}</p>
                                            <p className="text-lg font-bold text-emerald-400">{bonus}</p>
                                        </div>
                                    )}
                                </div>
                                <Briefcase className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                            </div>
                        )}
                    </aside>

                    {/* Main Content (Right) */}
                    <div className="flex-1">
                        {showApplyForm ? (
                            <div className="bg-surface rounded-[32px] border border-app p-8 md:p-12 animate-slide-up shadow-xl">
                                <ApplyForm
                                    jobId={job.id}
                                    jobTitle={title}
                                    onClose={() => setShowApplyForm(false)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Description */}
                                <section className="bg-surface rounded-[32px] border border-app p-8 md:p-12 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                                        <h3 className="text-xl font-heading font-black text-primary tracking-tight uppercase">
                                            {t('modal.jobDescription')}
                                        </h3>
                                    </div>
                                    <div className="space-y-4 text-base md:text-lg text-secondary font-medium leading-relaxed">
                                        {description?.map((p, i) => <p key={i}>{p}</p>)}
                                    </div>
                                </section>

                                {/* Requirements */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6 px-4">
                                        <div className="w-1.5 h-6 bg-[#D70F24] rounded-full" />
                                        <h3 className="text-xl font-heading font-black text-primary tracking-tight uppercase">
                                            {t('modal.requirements')}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {requirements?.map((req, i) => (
                                            <div key={i} className="p-6 bg-surface flex items-start gap-4 rounded-3xl border border-app hover:border-red-500/30 transition-colors group">
                                                <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm md:text-base font-bold text-primary leading-tight py-1">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Benefits */}
                                {benefits && benefits.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-6 px-4">
                                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                            <h3 className="text-xl font-heading font-black text-primary tracking-tight uppercase">
                                                {t('modal.benefits')}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {benefits.map((benefit: any, i) => (
                                                <div key={i} className="p-6 bg-surface border border-app rounded-3xl text-center space-y-4 hover:border-emerald-500/30 transition-colors group">
                                                    <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{benefit.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Comments Section */}
                                <section className="pt-8 border-t border-app">
                                    <JobComments jobId={job.id} />
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

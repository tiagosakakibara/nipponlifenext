"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { submitJobForm, uploadJobFile } from '@/app/actions/submitJobForm';
import {
    Briefcase, DollarSign, FileText, Image as ImageIcon,
    CheckCircle2, ChevronDown, ChevronUp, Upload, X, Loader2,
    Mail, Info, Plus, Trash2, Link
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

import { useTranslations } from 'next-intl';

// ─── Constants ────────────────────────────────────────────────────────────────

const PREFECTURES = [
    'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka',
    'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo',
    'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa',
    'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki',
    'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama',
    'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga', 'Shimane',
    'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori', 'Toyama',
    'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi',
];

// ─── Image Uploader ───────────────────────────────────────────────────────────

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const t = useTranslations('jobs.registration');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError('');
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'businesses');
        const result = await uploadJobFile(fd);
        setUploading(false);
        if ('error' in result) setError(result.error);
        else onChange(result.url);
    }, [onChange]);

    return (
        <div className="space-y-2">
            {value ? (
                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border-2 border-[var(--nl-accent)] group">
                    <Image src={value} alt="Capa" fill className="object-cover" />
                    <button type="button" onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div onClick={() => inputRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="aspect-video max-w-sm border-2 border-dashed border-[var(--nl-border)] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--nl-accent)] hover:bg-[var(--nl-accent)]/5 transition-all">
                    {uploading
                        ? <Loader2 className="w-6 h-6 animate-spin text-[var(--nl-accent)]" />
                        : (<>
                            <Upload className="w-6 h-6 text-[var(--nl-text-3)]" />
                            <span className="text-xs text-[var(--nl-text-3)] text-center px-4 whitespace-pre-line">
                                {t('uploadText')}
                            </span>
                        </>)}
                </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <input type="hidden" name="cover_image_url" value={value} />
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ icon: Icon, number, title, children, defaultOpen = true }:
    { icon: React.ElementType; number: string; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] shadow-sm overflow-hidden">
            <button type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-[var(--nl-bg)] transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--nl-accent)]/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-[var(--nl-accent)]" />
                </div>
                <div className="flex-1">
                    <span className="text-xs font-bold text-[var(--nl-accent)] uppercase tracking-widest">{number}</span>
                    <h2 className="font-heading font-bold text-lg text-[var(--nl-text)] leading-tight">{title}</h2>
                </div>
                {open ? <ChevronUp className="w-5 h-5 text-[var(--nl-text-3)]" /> : <ChevronDown className="w-5 h-5 text-[var(--nl-text-3)]" />}
            </button>
            {open && <div className="px-5 pb-6 md:px-6 border-t border-[var(--nl-border)] pt-5">{children}</div>}
        </div>
    );
}

function Field({ label, required, hint, children }:
    { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--nl-text)]">
                {label}{required && <span className="text-[var(--nl-accent)] ml-1">*</span>}
            </label>
            {hint && <p className="text-xs text-[var(--nl-text-3)]">{hint}</p>}
            {children}
        </div>
    );
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-[var(--nl-border)] bg-[var(--nl-bg)] text-[var(--nl-text)] text-sm placeholder:text-[var(--nl-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--nl-accent)] focus:border-transparent transition-all';

// ─── List editor (requirements / tags) ───────────────────────────────────────

function ListEditor({ label, hint, name, placeholder }:
    { label: string; hint: string; name: string; placeholder: string }) {
    const t = useTranslations('jobs.registration');
    const [items, setItems] = useState<string[]>(['']);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--nl-text)]">{label}</label>
            <p className="text-xs text-[var(--nl-text-3)]">{hint}</p>
            {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                    <input
                        type="text"
                        value={item}
                        placeholder={`${placeholder} ${i + 1}`}
                        onChange={e => setItems(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                        className={`${inputClass} flex-1`}
                    />
                    {items.length > 1 && (
                        <button type="button" onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
                            className="p-2.5 rounded-xl border border-[var(--nl-border)] text-[var(--nl-text-3)] hover:border-red-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={() => setItems(prev => [...prev, ''])}
                className="flex items-center gap-1.5 text-xs text-[var(--nl-accent)] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> {t('addItem')}
            </button>
            {/* Hidden textarea with all items joined */}
            <textarea name={name} className="hidden" readOnly value={items.filter(Boolean).join('\n')} />
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function JobRegistrationForm() {
    const t = useTranslations('jobs.registration');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [jobType, setJobType] = useState('fullTime');
    const [payUnit, setPayUnit] = useState('hour');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        const fd = new FormData(e.currentTarget);
        fd.set('cover_image_url', coverUrl);
        fd.set('job_type', jobType);
        fd.set('pay_unit', payUnit);

        const result = await submitJobForm(fd);
        setSubmitting(false);

        if ('error' in result) setSubmitError(result.error);
        else setSubmitted(true);
    }

    // ── Success ────────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[var(--nl-bg)] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[var(--nl-text)] mb-2">{t('successTitle')}</h1>
                        <p className="text-[var(--nl-text-2)] text-base leading-relaxed whitespace-pre-line">
                            {t('successMessage')}
                        </p>
                    </div>
                    <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] p-5 text-sm text-[var(--nl-text-3)]">
                        {t.rich('draftNote', { strong: (chunks) => <strong>{chunks}</strong> })}
                    </div>
                    <Image src="/images/logo-full.png" alt="NipponLife" width={140} height={40} className="mx-auto opacity-60" />
                </div>
            </div>
        );
    }

    const jobTypes = [
        { value: 'full-time', label: t('fullTime') },
        { value: 'part-time', label: t('partTime') },
        { value: 'contract', label: t('contract') },
        { value: 'temporary', label: t('temporary') },
        { value: 'alternado', label: t('alternado') },
    ];

    const payUnits = [
        { value: 'hour', label: t('hour') },
        { value: 'day', label: t('day') },
        { value: 'month', label: t('month') },
    ];

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[var(--nl-bg)]">
            {/* Header */}
            <div className="bg-[#002B52] text-white py-10 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <Image src="/images/logo-full.png" alt="NipponLife" width={160} height={48}
                        className="mx-auto brightness-0 invert" />
                    <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">
                        {t('title')}
                    </h1>
                    <p className="text-white/85 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        {t('headerSubtitle')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-5">

                {/* Info */}
                <div className="flex gap-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {t.rich('info', {
                            strong: (chunks) => <strong>{chunks}</strong>,
                            accent: (chunks) => <span className="text-[var(--nl-accent)] font-bold">{chunks}</span>
                        })}
                    </p>
                </div>

                {/* ── 01 Definição da Vaga ── */}
                <Section icon={Briefcase} number="01" title={t('section1')}>
                    <div className="space-y-4">
                        <Field label={t('jobTitle')} required>
                            <input type="text" name="title" required placeholder={t('jobTitlePlaceholder')} className={inputClass} />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label={t('companyName')} required>
                                <input type="text" name="company_name" required placeholder={t('companyNamePlaceholder')} className={inputClass} />
                            </Field>
                            <Field label={t('jobType')}>
                                <div className="flex flex-wrap gap-2">
                                    {jobTypes.map(type => (
                                        <button key={type.value} type="button" onClick={() => setJobType(type.value)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${jobType === type.value ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white' : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'}`}>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label={t('location')} required>
                                <select name="prefecture" required className={inputClass}>
                                    <option value="">{t('location')}...</option>
                                    {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </Field>
                            <Field label={t('city')}>
                                <input type="text" name="city" placeholder={t('cityPlaceholder')} className={inputClass} />
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* ── 02 Compensação e Salário ── */}
                <Section icon={DollarSign} number="02" title={t('section2')}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label={t('salaryLabel')} hint={t('salaryPlaceholder')}>
                                <input type="text" name="salary_text" placeholder={t('salaryPlaceholder')} className={inputClass} />
                            </Field>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[var(--nl-text)]">{t('payUnit')}</label>
                                <div className="flex gap-2">
                                    {payUnits.map(unit => (
                                        <button key={unit.value} type="button" onClick={() => setPayUnit(unit.value)}
                                            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${payUnit === unit.value ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white' : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'}`}>
                                            {unit.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Field label={t('yenAmount')} hint={t('yenHint')}>
                            <input type="number" name="pay_rate_yen" placeholder="1200" min="0" className={inputClass} />
                        </Field>
                        <Field label={t('bonusText')} hint={t('bonusHint')}>
                            <textarea name="bonus_text" rows={3} placeholder={t('bonusPlaceholder')} className={`${inputClass} resize-none`} />
                        </Field>
                    </div>
                </Section>

                {/* ── 03 Descrição e Requisitos ── */}
                <Section icon={FileText} number="03" title={t('section3')}>
                    <div className="space-y-4">
                        <Field label={t('description')} required hint={t('descriptionHint')}>
                            <textarea name="description" required rows={5} placeholder={t('descriptionPlaceholder')} className={`${inputClass} resize-none`} />
                        </Field>
                        <ListEditor
                            name="requirements"
                            label={t('requirements')}
                            hint={t('requirementsHint')}
                            placeholder={t('requirementsPlaceholder')}
                        />
                        <Field label={t('tags')} hint={t('tagsHint')}>
                            <input type="text" name="tags" placeholder={t('tagsPlaceholder')} className={inputClass} />
                        </Field>
                        <Field label={t('expiresAt')} hint={t('expiresAtHint')}>
                            <input type="date" name="expires_at" className={inputClass} />
                        </Field>
                    </div>
                </Section>

                {/* ── 04 Receber Candidaturas ── */}
                <Section icon={Link} number="04" title={t('section4')}>
                    <div className="space-y-4">
                        {/* Destaque visual */}
                        <div className="flex gap-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {t.rich('contactEmailHint', { strong: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                        </div>

                        <Field
                            label={t('contactEmail')}
                            required
                            hint={t('contactEmailHint')}
                        >
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                <input
                                    type="email"
                                    name="contact_email"
                                    required
                                    placeholder={t('emailPlaceholder')}
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </Field>

                        {/* Como vai chegar */}
                        <div className="rounded-xl border border-[var(--nl-border)] overflow-hidden">
                            <div className="px-4 py-2.5 bg-[var(--nl-bg)] border-b border-[var(--nl-border)]">
                                <p className="text-xs font-bold text-[var(--nl-text-3)] uppercase tracking-widest">{t('howItWorks')}</p>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                {[
                                    { dot: 'bg-[var(--nl-accent)]', text: t('sender') },
                                    { dot: 'bg-blue-500', text: t('subject') },
                                    { dot: 'bg-green-500', text: t('content') },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <div className={`w-2 h-2 rounded-full ${item.dot} flex-shrink-0 mt-1`} />
                                        <p className="text-xs text-[var(--nl-text-2)] leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ── 05 Logo / Banner ── */}
                <Section icon={ImageIcon} number="05" title={t('section5')} defaultOpen={false}>
                    <ImageUploader value={coverUrl} onChange={setCoverUrl} />
                </Section>

                {/* Submit */}
                {submitError && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                        {submitError}
                    </div>
                )}

                <button type="submit" disabled={submitting}
                    className="w-full py-4 rounded-xl bg-[var(--nl-accent)] text-white font-heading font-bold text-base hover:bg-[var(--nl-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--nl-accent)]/20">
                    {submitting
                        ? <><Loader2 className="w-5 h-5 animate-spin" />{t('submitting')}</>
                        : <><CheckCircle2 className="w-5 h-5" />{t('submitButton')}</>}
                </button>

                <p className="text-center text-xs text-[var(--nl-text-3)] pb-8">
                    {t('agreement')}
                </p>
            </form>
        </div>
    );
}

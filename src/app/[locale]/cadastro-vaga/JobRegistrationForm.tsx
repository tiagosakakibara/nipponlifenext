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

const JOB_TYPES = [
    { value: 'full-time', label: 'Tempo integral' },
    { value: 'part-time', label: 'Meio período' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporário' },
];

const PAY_UNITS = [
    { value: 'hour', label: 'Por hora' },
    { value: 'day', label: 'Por dia' },
    { value: 'month', label: 'Por mês' },
];

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
                            <span className="text-xs text-[var(--nl-text-3)] text-center px-4">
                                Clique ou arraste a imagem aqui<br />JPG, PNG, WEBP — máx 10MB
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
                <Plus className="w-3.5 h-3.5" /> Adicionar item
            </button>
            {/* Hidden textarea with all items joined */}
            <textarea name={name} className="hidden" readOnly value={items.filter(Boolean).join('\n')} />
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function JobRegistrationForm() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [jobType, setJobType] = useState('full-time');
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
                        <h1 className="font-heading text-3xl font-bold text-[var(--nl-text)] mb-2">Vaga enviada! 🎉</h1>
                        <p className="text-[var(--nl-text-2)] text-base leading-relaxed">
                            Sua vaga foi enviada com sucesso e está em análise.<br />
                            Nossa equipe irá revisá-la e publicar em breve.
                        </p>
                    </div>
                    <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] p-5 text-sm text-[var(--nl-text-3)]">
                        A vaga entrará como <strong>rascunho</strong> e ficará visível após a publicação pela equipe NipponLife.
                    </div>
                    <Image src="/images/logo-full.png" alt="NipponLife" width={140} height={40} className="mx-auto opacity-60" />
                </div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[var(--nl-bg)]">
            {/* Header */}
            <div className="bg-[var(--nl-accent)] text-white py-10 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <Image src="/images/logo-full.png" alt="NipponLife" width={160} height={48}
                        className="mx-auto brightness-0 invert" />
                    <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">
                        Publicar Vaga de Emprego
                    </h1>
                    <p className="text-white/85 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        Preencha os dados da vaga para que possamos publicá-la no NipponLife e alcançar
                        candidatos qualificados da comunidade brasileira no Japão.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-5">

                {/* Info */}
                <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Campos com <span className="text-[var(--nl-accent)] font-bold">*</span> são obrigatórios.
                        A vaga entrará como <strong>rascunho</strong> e será revisada antes de ser publicada.
                    </p>
                </div>

                {/* ── 01 Definição da Vaga ── */}
                <Section icon={Briefcase} number="01" title="Definição da Vaga">
                    <div className="space-y-4">
                        <Field label="Título do cargo" required>
                            <input type="text" name="title" required placeholder="Ex: Operador de Produção" className={inputClass} />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nome da empresa" required>
                                <input type="text" name="company_name" required placeholder="Ex: Toyota do Japão" className={inputClass} />
                            </Field>
                            <Field label="Tipo de emprego">
                                <div className="flex flex-wrap gap-2">
                                    {JOB_TYPES.map(t => (
                                        <button key={t.value} type="button" onClick={() => setJobType(t.value)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${jobType === t.value ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white' : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Prefeitura (Ken)" required>
                                <select name="prefecture" required className={inputClass}>
                                    <option value="">Selecione...</option>
                                    {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </Field>
                            <Field label="Cidade">
                                <input type="text" name="city" placeholder="Ex: Toyota-shi" className={inputClass} />
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* ── 02 Compensação e Salário ── */}
                <Section icon={DollarSign} number="02" title="Compensação e Salário">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Rótulo de salário público" hint="Ex: ¥1.200 ~ ¥1.500/hr">
                                <input type="text" name="salary_text" placeholder="¥1.200 ~ ¥1.500/hr" className={inputClass} />
                            </Field>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[var(--nl-text)]">Unidade</label>
                                <div className="flex gap-2">
                                    {PAY_UNITS.map(u => (
                                        <button key={u.value} type="button" onClick={() => setPayUnit(u.value)}
                                            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${payUnit === u.value ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white' : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'}`}>
                                            {u.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Field label="Valor em ienes (¥)" hint="Número sem formatação, ex: 1200">
                            <input type="number" name="pay_rate_yen" placeholder="1200" min="0" className={inputClass} />
                        </Field>
                        <Field label="Texto de bônus e extras" hint="Ex: Auxílio transporte, bônus anual, apoio moradia...">
                            <textarea name="bonus_text" rows={3} placeholder="Descreva benefícios adicionais..." className={`${inputClass} resize-none`} />
                        </Field>
                    </div>
                </Section>

                {/* ── 03 Descrição e Requisitos ── */}
                <Section icon={FileText} number="03" title="Descrição e Requisitos">
                    <div className="space-y-4">
                        <Field label="Descrição da vaga" required hint="Descreva as atividades, ambiente de trabalho, diferenciais...">
                            <textarea name="description" required rows={5} placeholder="Detalhe as responsabilidades e o ambiente de trabalho..." className={`${inputClass} resize-none`} />
                        </Field>
                        <ListEditor
                            name="requirements"
                            label="Requisitos"
                            hint="Liste os requisitos da vaga, um por campo."
                            placeholder="Requisito"
                        />
                        <Field label="Tags / palavras-chave" hint="Separadas por vírgula. Ex: manufatura, linha de montagem, japonês básico">
                            <input type="text" name="tags" placeholder="manufatura, Toyota, japonês N5..." className={inputClass} />
                        </Field>
                        <Field label="Validade da vaga" hint="Deixe em branco para sem prazo definido">
                            <input type="date" name="expires_at" className={inputClass} />
                        </Field>
                    </div>
                </Section>

                {/* ── 04 Receber Candidaturas ── */}
                <Section icon={Link} number="04" title="Receber Candidaturas">
                    <div className="space-y-4">
                        {/* Destaque visual */}
                        <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                Quando um candidato clicar em <strong>"Enviar Candidatura"</strong> na sua vaga,
                                o NipponLife enviará automaticamente os dados dele para o seu e-mail abaixo.
                            </p>
                        </div>

                        <Field
                            label="E-mail para receber candidaturas"
                            required
                            hint="Use um e-mail que você verifica com frequência. Cada candidatura chegará direto na sua caixa de entrada."
                        >
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                <input
                                    type="email"
                                    name="contact_email"
                                    required
                                    placeholder="suaempresa@email.com"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </Field>

                        {/* Como vai chegar */}
                        <div className="rounded-xl border border-[var(--nl-border)] overflow-hidden">
                            <div className="px-4 py-2.5 bg-[var(--nl-bg)] border-b border-[var(--nl-border)]">
                                <p className="text-xs font-bold text-[var(--nl-text-3)] uppercase tracking-widest">Como o e-mail chegará</p>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                {[
                                    { dot: 'bg-[var(--nl-accent)]', text: 'Remetente: NipponLife Candidaturas <candidaturas@nippon-life.com>' },
                                    { dot: 'bg-blue-500', text: 'Assunto: 📋 Nova candidatura para "[Título da Vaga]" — [Nome do candidato]' },
                                    { dot: 'bg-green-500', text: 'Conteúdo: Nome, WhatsApp (com link direto), cidade e mensagem do candidato' },
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
                <Section icon={ImageIcon} number="05" title="Logo ou Banner da Empresa" defaultOpen={false}>
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
                        ? <><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>
                        : <><CheckCircle2 className="w-5 h-5" />Enviar Vaga</>}
                </button>

                <p className="text-center text-xs text-[var(--nl-text-3)] pb-8">
                    Ao enviar, você concorda que as informações da vaga serão publicadas no portal NipponLife.
                </p>
            </form>
        </div>
    );
}

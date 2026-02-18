"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { submitEventForm, uploadEventFile } from '@/app/actions/submitEventForm';
import {
    Calendar, MapPin, Image as ImageIcon, FileText,
    CheckCircle2, ChevronDown, ChevronUp, Upload, X, Loader2,
    Link, Info, Clock, Users
} from 'lucide-react';

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
        fd.append('folder', 'events');
        const result = await uploadEventFile(fd);
        setUploading(false);
        if ('error' in result) setError(result.error);
        else onChange(result.url);
    }, [onChange]);

    return (
        <div className="space-y-2">
            {value ? (
                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border-2 border-[var(--nl-accent)] group">
                    <Image src={value} alt="Banner do evento" fill className="object-cover" />
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
                                Clique ou arraste o banner aqui<br />JPG, PNG, WEBP — máx 10MB
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

// ─── Datetime helper ──────────────────────────────────────────────────────────

function DateTimeField({ label, name, required, hint }: { label: string; name: string; required?: boolean; hint?: string }) {
    return (
        <Field label={label} required={required} hint={hint}>
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                <input
                    type="datetime-local"
                    name={name}
                    required={required}
                    className={`${inputClass} pl-9`}
                />
            </div>
        </Field>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function EventRegistrationForm() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        const fd = new FormData(e.currentTarget);
        fd.set('cover_image_url', coverUrl);

        const result = await submitEventForm(fd);
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
                        <h1 className="font-heading text-3xl font-bold text-[var(--nl-text)] mb-2">Evento enviado! 🎉</h1>
                        <p className="text-[var(--nl-text-2)] text-base leading-relaxed">
                            Seu evento foi enviado com sucesso e está em análise.<br />
                            Nossa equipe irá revisá-lo e publicar no calendário em breve.
                        </p>
                    </div>
                    <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] p-5 text-sm text-[var(--nl-text-3)]">
                        O evento entrará como <strong>rascunho</strong> e ficará visível após a publicação pela equipe NipponLife.
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
                        Divulgar Evento
                    </h1>
                    <p className="text-white/85 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        Preencha os dados do seu evento para publicá-lo no calendário do NipponLife
                        e alcançar toda a comunidade brasileira no Japão.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-5">

                {/* Info */}
                <div className="flex gap-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        Campos com <span className="text-[var(--nl-accent)] font-bold">*</span> são obrigatórios.
                        O evento entrará como <strong>rascunho</strong> e será revisada antes de ser publicado no calendário.
                    </p>
                </div>

                {/* ── 01 Sobre o Evento ── */}
                <Section icon={Calendar} number="01" title="Sobre o Evento">
                    <div className="space-y-4">
                        <Field label="Título do evento" required>
                            <input type="text" name="title" required
                                placeholder="Ex: Festival Brasileiro de Verão em Osaka"
                                className={inputClass} />
                        </Field>
                        <Field label="Descrição" hint="Conte o que vai acontecer, para quem é e o que as pessoas podem esperar.">
                            <textarea name="description" rows={5}
                                placeholder="Detalhe o evento, atrações, programação, ingressos..."
                                className={`${inputClass} resize-none`} />
                        </Field>
                    </div>
                </Section>

                {/* ── 02 Data e Hora ── */}
                <Section icon={Clock} number="02" title="Data e Hora">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DateTimeField
                            label="Início"
                            name="starts_at"
                            required
                            hint="Data e hora de início do evento"
                        />
                        <DateTimeField
                            label="Fim"
                            name="ends_at"
                            hint="Opcional — data e hora de encerramento"
                        />
                    </div>

                    {/* Visual date preview */}
                    <div className="mt-4 p-4 bg-[var(--nl-accent)]/5 border border-[var(--nl-accent)]/20 rounded-xl">
                        <p className="text-xs text-[var(--nl-text-3)]">
                            <span className="font-semibold text-[var(--nl-accent)]">Dica:</span> Para eventos de dia inteiro, coloque 00:00 como horário de início e 23:59 como término.
                            Para eventos recorrentes, cadastre cada data separadamente.
                        </p>
                    </div>
                </Section>

                {/* ── 03 Local ── */}
                <Section icon={MapPin} number="03" title="Local">
                    <div className="space-y-4">
                        <Field label="Nome do local / endereço" hint="Ex: Parque Yoyogi, Tokyo — ou endereço completo">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                <input type="text" name="location"
                                    placeholder="Ex: Centro Comunitário Nikkei, Hamamatsu"
                                    className={`${inputClass} pl-9`} />
                            </div>
                        </Field>
                        <Field label="Link do Google Maps" hint="Cole o link de compartilhamento">
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                <input type="url" name="google_maps_url"
                                    placeholder="https://maps.google.com/..."
                                    className={`${inputClass} pl-9`} />
                            </div>
                        </Field>

                        {/* Online event notice */}
                        <div className="flex gap-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                                Para eventos <strong>online</strong>, escreva "Online" no campo de local e cole o link da transmissão no campo de contato/inscrição abaixo.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* ── 04 Inscrição / Contato ── */}
                <Section icon={FileText} number="04" title="Inscrição e Contato">
                    <div className="space-y-4">
                        <Field
                            label="Link de inscrição ou contato"
                            hint="WhatsApp, Eventbrite, Google Forms, Instagram ou qualquer link para participar"
                        >
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                <input type="url" name="contact_url"
                                    placeholder="https://wa.me/... ou https://forms.google.com/..."
                                    className={`${inputClass} pl-9`} />
                            </div>
                        </Field>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                            {[
                                { label: 'WhatsApp', hint: 'wa.me/...' },
                                { label: 'Eventbrite', hint: 'eventbrite.com/...' },
                                { label: 'Google Forms', hint: 'forms.gle/...' },
                            ].map(tag => (
                                <div key={tag.label} className="rounded-xl border border-[var(--nl-border)] px-3 py-2 text-center">
                                    <p className="text-xs font-semibold text-[var(--nl-text-2)]">{tag.label}</p>
                                    <p className="text-[0.65rem] text-[var(--nl-text-3)]">{tag.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ── 05 Banner / Imagem ── */}
                <Section icon={ImageIcon} number="05" title="Banner do Evento" defaultOpen={false}>
                    <div className="space-y-3">
                        <p className="text-sm text-[var(--nl-text-2)]">
                            Adicione um banner atrativo para o seu evento. Proporção 16:9. Recomendado: 1200×675px.
                        </p>
                        <ImageUploader value={coverUrl} onChange={setCoverUrl} />
                    </div>
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
                        : <><CheckCircle2 className="w-5 h-5" />Enviar Evento</>}
                </button>

                <p className="text-center text-xs text-[var(--nl-text-3)] pb-8">
                    Ao enviar, você autoriza a publicação das informações do evento no calendário do NipponLife.
                </p>
            </form>
        </div>
    );
}

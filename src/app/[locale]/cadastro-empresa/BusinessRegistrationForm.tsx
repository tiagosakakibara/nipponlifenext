"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { submitBusinessForm, uploadBusinessFile } from '@/app/actions/submitBusinessForm';
import {
    Building2, MapPin, Phone, Clock, Image as ImageIcon,
    CheckCircle2, ChevronDown, ChevronUp, Upload, X, Loader2,
    Globe, Instagram, MessageCircle, DollarSign, Languages, Info
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type DayKey = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo' | 'feriados';

const DAYS: { key: DayKey; label: string }[] = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
    { key: 'feriados', label: 'Feriados' },
];

const CATEGORIES = [
    'Gastronomia',
    'Saúde & Bem-estar',
    'Serviços',
    'Imobiliárias',
    'Jurídico e Vistos',
    'Mudanças e Logística',
    'Tecnologia',
    'Outros',
];

const PRICE_RANGES = [
    { value: '$', label: '$', desc: 'Econômico' },
    { value: '$$', label: '$$', desc: 'Moderado' },
    { value: '$$$', label: '$$$', desc: 'Sofisticado' },
    { value: '$$$$', label: '$$$$', desc: 'Premium' },
];

const LANGUAGES = [
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: 'Japonês' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'outros', label: 'Outros' },
];

// ─── Image Uploader Component ─────────────────────────────────────────────────

function ImageUploader({
    label,
    hint,
    fieldName,
    ratio = '16:9',
    value,
    onChange,
}: {
    label: string;
    hint: string;
    fieldName: string;
    ratio?: '1:1' | '16:9';
    value: string;
    onChange: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError('');
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', fieldName === 'logo_url' ? 'logos' : 'covers');
        const result = await uploadBusinessFile(fd);
        setUploading(false);
        if ('error' in result) {
            setError(result.error);
        } else {
            onChange(result.url);
        }
    }, [fieldName, onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const aspectClass = ratio === '1:1' ? 'aspect-square' : 'aspect-video';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--nl-text)]">{label}</label>
            <p className="text-xs text-[var(--nl-text-3)]">{hint}</p>

            {value ? (
                <div className={`relative ${aspectClass} max-w-xs rounded-xl overflow-hidden border-2 border-[var(--nl-accent)] group`}>
                    <Image src={value} alt={label} fill className="object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--nl-accent)]"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`${aspectClass} max-w-xs border-2 border-dashed border-[var(--nl-border)] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--nl-accent)] hover:bg-[var(--nl-accent)]/5 transition-all`}
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--nl-accent)]" />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-[var(--nl-text-3)]" />
                            <span className="text-xs text-[var(--nl-text-3)] text-center px-2">
                                Clique ou arraste a imagem aqui<br />JPG, PNG, WEBP — máx 10MB
                            </span>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
            {/* Hidden input para enviar a URL no FormData */}
            <input type="hidden" name={fieldName} value={value} />
        </div>
    );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    number,
    title,
    children,
    defaultOpen = true,
}: {
    icon: React.ElementType;
    number: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-[var(--nl-bg)] transition-colors"
            >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--nl-accent)]/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-[var(--nl-accent)]" />
                </div>
                <div className="flex-1">
                    <span className="text-xs font-bold text-[var(--nl-accent)] uppercase tracking-widest">{number}</span>
                    <h2 className="font-heading font-bold text-lg text-[var(--nl-text)] leading-tight">{title}</h2>
                </div>
                {open ? (
                    <ChevronUp className="w-5 h-5 text-[var(--nl-text-3)]" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--nl-text-3)]" />
                )}
            </button>
            {open && (
                <div className="px-5 pb-6 md:px-6 border-t border-[var(--nl-border)] pt-5">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
    label,
    required,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--nl-text)]">
                {label}
                {required && <span className="text-[var(--nl-accent)] ml-1">*</span>}
            </label>
            {hint && <p className="text-xs text-[var(--nl-text-3)]">{hint}</p>}
            {children}
        </div>
    );
}

const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-[var(--nl-border)] bg-[var(--nl-bg)] text-[var(--nl-text)] text-sm placeholder:text-[var(--nl-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--nl-accent)] focus:border-transparent transition-all';

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function BusinessRegistrationForm() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [charCount, setCharCount] = useState(0);

    // Image URLs
    const [logoUrl, setLogoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // Hours state
    const [hoursOpen, setHoursOpen] = useState<Record<DayKey, boolean>>({
        segunda: true, terca: true, quarta: true, quinta: true,
        sexta: true, sabado: false, domingo: false, feriados: false,
    });
    const [hoursFrom, setHoursFrom] = useState<Record<DayKey, string>>(
        Object.fromEntries(DAYS.map(d => [d.key, '09:00'])) as Record<DayKey, string>
    );
    const [hoursTo, setHoursTo] = useState<Record<DayKey, string>>(
        Object.fromEntries(DAYS.map(d => [d.key, '18:00'])) as Record<DayKey, string>
    );

    // Languages
    const [langs, setLangs] = useState<string[]>(['pt']);

    // Price
    const [price, setPrice] = useState('$$');

    const formRef = useRef<HTMLFormElement>(null);

    const toggleLang = (v: string) =>
        setLangs(prev => prev.includes(v) ? prev.filter(l => l !== v) : [...prev, v]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        const fd = new FormData(e.currentTarget);

        // Adicionar campos controlados
        fd.set('logo_url', logoUrl);
        fd.set('cover_image_url', coverUrl);
        fd.set('price_range', price);

        // Remover entradas antigas de langs e recolocar
        fd.delete('languages_supported');
        langs.forEach(l => fd.append('languages_supported', l));

        // Horários
        DAYS.forEach(({ key }) => {
            fd.set(`hours_open_${key}`, hoursOpen[key] ? 'true' : 'false');
            fd.set(`hours_from_${key}`, hoursFrom[key] || '');
            fd.set(`hours_to_${key}`, hoursTo[key] || '');
        });

        const result = await submitBusinessForm(fd);
        setSubmitting(false);

        if ('error' in result) {
            setSubmitError(result.error);
        } else {
            setSubmitted(true);
        }
    }

    // ── Success Screen ─────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[var(--nl-bg)] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6 animate-[fadeInSlideUp_0.6s_ease-out_forwards]">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[var(--nl-text)] mb-2">
                            Obrigado! 🎉
                        </h1>
                        <p className="text-[var(--nl-text-2)] text-base leading-relaxed">
                            Os dados da sua empresa foram enviados com sucesso.<br />
                            Nossa equipe irá revisar e publicar seu perfil em breve.
                        </p>
                    </div>
                    <div className="bg-[var(--nl-surface)] rounded-2xl border border-[var(--nl-border)] p-5 text-sm text-[var(--nl-text-3)]">
                        <p>Você receberá uma confirmação assim que seu perfil estiver no ar. Enquanto isso, pode entrar em contato conosco pelo WhatsApp.</p>
                    </div>
                    <Image
                        src="/images/logo-full.png"
                        alt="NipponLife"
                        width={140}
                        height={40}
                        className="mx-auto opacity-60"
                    />
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
                    <Image
                        src="/images/logo-full.png"
                        alt="NipponLife"
                        width={160}
                        height={48}
                        className="mx-auto brightness-0 invert"
                    />
                    <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">
                        Cadastre sua Empresa
                    </h1>
                    <p className="text-white/85 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        Preencha os dados da sua empresa para que possamos criar seu perfil no NipponLife.
                        Quanto mais completo, melhor será sua visibilidade!
                    </p>
                </div>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-5">

                {/* Info box */}
                <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Campos marcados com <span className="text-[var(--nl-accent)] font-bold">*</span> são obrigatórios.
                        Seu cadastro entrará como <strong>rascunho</strong> e será revisado antes de ser publicado.
                    </p>
                </div>

                {/* ── 01 Informações Básicas ── */}
                <Section icon={Building2} number="01" title="Informações Básicas">
                    <div className="space-y-4">
                        <Field label="Nome da empresa" required>
                            <input
                                type="text"
                                name="business_name"
                                required
                                placeholder="Ex: Restaurante Sakura"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Categoria" required>
                            <select name="category" required className={inputClass}>
                                <option value="">Selecione uma categoria...</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="Descrição curta"
                            required
                            hint="Máximo 160 caracteres. Aparece nos resultados de busca."
                        >
                            <div className="relative">
                                <textarea
                                    name="description_short"
                                    required
                                    maxLength={160}
                                    rows={3}
                                    placeholder="Uma frase que descreva sua empresa..."
                                    className={`${inputClass} resize-none`}
                                    onChange={(e) => setCharCount(e.target.value.length)}
                                />
                                <span className={`absolute bottom-2 right-3 text-xs ${charCount > 140 ? 'text-[var(--nl-accent)]' : 'text-[var(--nl-text-3)]'}`}>
                                    {charCount}/160
                                </span>
                            </div>
                        </Field>

                        <Field label="Descrição completa" hint="Conte mais sobre seus serviços, história, diferenciais...">
                            <textarea
                                name="description_long"
                                rows={5}
                                placeholder="Descreva sua empresa com mais detalhes..."
                                className={`${inputClass} resize-none`}
                            />
                        </Field>
                    </div>
                </Section>

                {/* ── 02 Localização ── */}
                <Section icon={MapPin} number="02" title="Localização">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Endereço" required>
                                <input type="text" name="address_line1" required placeholder="Rua, número" className={inputClass} />
                            </Field>
                            <Field label="Complemento">
                                <input type="text" name="address_line2" placeholder="Apto, sala..." className={inputClass} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Bairro / Distrito">
                                <input type="text" name="neighborhood" placeholder="Bairro" className={inputClass} />
                            </Field>
                            <Field label="CEP / Código Postal">
                                <input type="text" name="postal_code" placeholder="000-0000" className={inputClass} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Cidade" required>
                                <input type="text" name="city" required placeholder="Ex: Hamamatsu" className={inputClass} />
                            </Field>
                            <Field label="Prefeitura" required>
                                <input type="text" name="prefecture" required placeholder="Ex: Shizuoka" className={inputClass} />
                            </Field>
                        </div>
                        <Field label="Link do Google Maps" hint="Cole o link de compartilhamento do Google Maps">
                            <input type="url" name="google_maps_url" placeholder="https://maps.google.com/..." className={inputClass} />
                        </Field>
                    </div>
                </Section>

                {/* ── 03 Contato ── */}
                <Section icon={Phone} number="03" title="Contato">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Telefone">
                                <input type="tel" name="phone" placeholder="+55 11 99999-9999" className={inputClass} />
                            </Field>
                            <Field label="WhatsApp">
                                <input type="tel" name="whatsapp" placeholder="+55 11 99999-9999" className={inputClass} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="E-mail">
                                <input type="email" name="email" placeholder="contato@empresa.com" className={inputClass} />
                            </Field>
                            <Field label="Site">
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                    <input type="url" name="website_url" placeholder="https://..." className={`${inputClass} pl-9`} />
                                </div>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Instagram">
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                    <input type="text" name="instagram_url" placeholder="@suaempresa" className={`${inputClass} pl-9`} />
                                </div>
                            </Field>
                            <Field label="LINE">
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nl-text-3)]" />
                                    <input type="text" name="line_url" placeholder="ID ou link do LINE" className={`${inputClass} pl-9`} />
                                </div>
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* ── 04 Imagens ── */}
                <Section icon={ImageIcon} number="04" title="Imagens">
                    <div className="space-y-6">
                        <ImageUploader
                            label="Logo da empresa"
                            hint="Proporção quadrada (1:1). Recomendado: 400×400px."
                            fieldName="logo_url"
                            ratio="1:1"
                            value={logoUrl}
                            onChange={setLogoUrl}
                        />
                        <div className="border-t border-[var(--nl-border)]" />
                        <ImageUploader
                            label="Foto de capa"
                            hint="Proporção 16:9. Recomendado: 1200×675px."
                            fieldName="cover_image_url"
                            ratio="16:9"
                            value={coverUrl}
                            onChange={setCoverUrl}
                        />
                    </div>
                </Section>

                {/* ── 05 Funcionamento ── */}
                <Section icon={Clock} number="05" title="Funcionamento" defaultOpen={false}>
                    <div className="space-y-6">

                        {/* Horários */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[var(--nl-text)] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--nl-accent)]" />
                                Horário de funcionamento
                            </h3>
                            <div className="space-y-2">
                                {DAYS.map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-3 py-2 border-b border-[var(--nl-border)] last:border-0">
                                        {/* Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setHoursOpen(prev => ({ ...prev, [key]: !prev[key] }))}
                                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${hoursOpen[key] ? 'bg-[var(--nl-accent)]' : 'bg-[var(--nl-border)]'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hoursOpen[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="text-sm text-[var(--nl-text)] w-36 flex-shrink-0">{label}</span>
                                        {hoursOpen[key] ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="time"
                                                    value={hoursFrom[key]}
                                                    onChange={e => setHoursFrom(p => ({ ...p, [key]: e.target.value }))}
                                                    className="px-2 py-1 text-sm rounded-lg border border-[var(--nl-border)] bg-[var(--nl-bg)] text-[var(--nl-text)] focus:outline-none focus:ring-1 focus:ring-[var(--nl-accent)]"
                                                />
                                                <span className="text-[var(--nl-text-3)] text-xs">até</span>
                                                <input
                                                    type="time"
                                                    value={hoursTo[key]}
                                                    onChange={e => setHoursTo(p => ({ ...p, [key]: e.target.value }))}
                                                    className="px-2 py-1 text-sm rounded-lg border border-[var(--nl-border)] bg-[var(--nl-bg)] text-[var(--nl-text)] focus:outline-none focus:ring-1 focus:ring-[var(--nl-accent)]"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-[var(--nl-text-3)] italic">Fechado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Faixa de preço */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[var(--nl-text)] flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[var(--nl-accent)]" />
                                Faixa de preço
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {PRICE_RANGES.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setPrice(p.value)}
                                        className={`flex flex-col items-center px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${price === p.value
                                            ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white'
                                            : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'
                                            }`}
                                    >
                                        <span>{p.label}</span>
                                        <span className="text-[0.65rem] font-normal opacity-75">{p.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Idiomas */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[var(--nl-text)] flex items-center gap-2">
                                <Languages className="w-4 h-4 text-[var(--nl-accent)]" />
                                Idiomas atendidos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.value}
                                        type="button"
                                        onClick={() => toggleLang(l.value)}
                                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${langs.includes(l.value)
                                            ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white'
                                            : 'border-[var(--nl-border)] text-[var(--nl-text-2)] hover:border-[var(--nl-accent)]'
                                            }`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </Section>

                {/* Submit */}
                {submitError && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                        {submitError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-[var(--nl-accent)] text-white font-heading font-bold text-base hover:bg-[var(--nl-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--nl-accent)]/20"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Enviar Cadastro
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-[var(--nl-text-3)] pb-8">
                    Ao enviar, você concorda que seus dados serão utilizados para criar seu perfil público no NipponLife.
                </p>
            </form>
        </div>
    );
}

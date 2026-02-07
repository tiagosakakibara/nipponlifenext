"use client";

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ApplyFormData {
    name: string;
    whatsapp: string;
    city: string;
    message: string;
}

interface ApplyFormProps {
    jobTitle: string;
    onClose: () => void;
}

export function ApplyForm({ jobTitle, onClose }: ApplyFormProps) {
    const t = useTranslations('jobs.modal');
    const [formData, setFormData] = useState<ApplyFormData>({
        name: '',
        whatsapp: '',
        city: '',
        message: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ApplyFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ApplyFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('fullNameRequired');
        }

        if (!formData.whatsapp.trim()) {
            newErrors.whatsapp = t('whatsappRequired');
        } else if (!/^[\d\s\-+()]+$/.test(formData.whatsapp)) {
            newErrors.whatsapp = t('whatsappInvalid');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleChange = (field: keyof ApplyFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-[32px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-heading font-bold text-primary">
                        {t('successTitle')}
                    </h3>
                    <p className="text-muted font-medium" dangerouslySetInnerHTML={{ __html: t('successMessage', { jobTitle }) }} />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                    {t('close')}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-primary uppercase tracking-tight">
                {t('formTitle')}
            </h3>

            <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                        {t('fullName')} *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-6 py-4 bg-surface border rounded-2xl text-xs font-bold text-primary focus:bg-app focus:border-[#D70F24] transition-all outline-none ${errors.name ? 'border-red-500' : 'border-app'
                            }`}
                        placeholder={t('fullNamePlaceholder')}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.name}</p>}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                        {t('whatsapp')} *
                    </label>
                    <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        className={`w-full px-6 py-4 bg-surface border rounded-2xl text-xs font-bold text-primary focus:bg-app focus:border-[#D70F24] transition-all outline-none ${errors.whatsapp ? 'border-red-500' : 'border-app'
                            }`}
                        placeholder={t('whatsappPlaceholder')}
                    />
                    {errors.whatsapp && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.whatsapp}</p>}
                </div>

                {/* Cidade */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                        {t('cityProvince')} <span className="opacity-50">{t('optional')}</span>
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-6 py-4 bg-surface border border-app rounded-2xl text-xs font-bold text-primary focus:bg-app focus:border-[#D70F24] transition-all outline-none"
                        placeholder={t('cityPlaceholder')}
                    />
                </div>

                {/* Mensagem */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                        {t('message')} <span className="opacity-50">{t('optional')}</span>
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        rows={3}
                        className="w-full px-6 py-4 bg-surface border border-app rounded-2xl text-xs font-bold text-primary focus:bg-app focus:border-[#D70F24] transition-all outline-none resize-none"
                        placeholder={t('messagePlaceholder')}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D70F24] text-white font-bold text-xs uppercase tracking-widest py-5 rounded-3xl transition-all shadow-xl shadow-red-500/10 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('sending')}
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        {t('submitApplication')}
                    </>
                )}
            </button>
        </form>
    );
}

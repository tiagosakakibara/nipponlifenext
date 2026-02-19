"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function ForgotPasswordPageClient() {
    const t = useTranslations();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError(t('auth.forgotPassword.errors.fillEmail'));
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) {
                // Rate limit or other API errors
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            console.error('[Forgot Password] Unexpected error:', err);
            setError(t('auth.forgotPassword.errors.unexpected'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 min-h-[60vh]">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-app rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#003768] to-[#5593C3] text-center">
                        <h1 className="text-xl font-bold text-white">{t('auth.forgotPassword.title')}</h1>
                        <p className="text-white/70 text-sm mt-1">
                            {t('auth.forgotPassword.subtitle')}
                        </p>
                    </div>

                    <div className="p-6">
                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {t('auth.forgotPassword.successTitle')}
                                </h2>
                                <p className="text-muted text-sm mb-6">
                                    {t('auth.forgotPassword.successMessage', { email })}
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-primary rounded-xl font-medium transition-colors"
                                >
                                    {t('auth.forgotPassword.backToLogin')}
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-secondary mb-4">
                                    {t('auth.forgotPassword.instruction')}
                                </p>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1.5">
                                        {t('auth.forgotPassword.emailLabel')}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t('auth.forgotPassword.emailPlaceholder')}
                                            className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="flex flex-col gap-2 p-3 bg-[#D70F24]/10 border border-[#D70F24]/30 rounded-xl text-[#D70F24] text-sm">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#D70F24] hover:bg-[#b80d1f] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('auth.forgotPassword.sending')}
                                        </>
                                    ) : (
                                        t('auth.forgotPassword.submitButton')
                                    )}
                                </button>

                                <div className="pt-2 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3 mr-1" />
                                        {t('auth.forgotPassword.backToLogin')}
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function RegisterPageClient() {
    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const nextUrl = searchParams.get('next') || `/${locale}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password || !confirmPassword) {
            setError(t('auth.registerPage.errors.fillFields'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.registerPage.errors.passwordsDontMatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.registerPage.errors.passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                    setError(t('auth.registerPage.errors.emailTaken'));
                } else {
                    setError(authError.message);
                }
                return;
            }

            setSuccess(true);

            // Full page navigation após 2 segundos garante cookies frescos e re-inicialização limpa do AuthContext
            setTimeout(() => {
                window.location.href = nextUrl;
            }, 2000);

        } catch (err) {
            console.error('[Register] Unexpected error:', err);
            setError(t('auth.registerPage.errors.unexpected'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-surface border border-app rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-primary mb-2">{t('auth.registerPage.successTitle')}</h2>
                        <p className="text-secondary text-sm">
                            {t('auth.registerPage.successSubtitle')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-app rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#003768] to-[#5593C3] text-center">
                        <h1 className="text-xl font-bold text-white">{t('auth.registerPage.title')}</h1>
                        <p className="text-white/70 text-sm mt-1">
                            {t('auth.registerPage.subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.registerPage.emailLabel')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.registerPage.emailPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.registerPage.passwordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('auth.registerPage.passwordPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.registerPage.confirmPasswordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('auth.registerPage.confirmPasswordPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-[#D70F24]/10 border border-[#D70F24]/30 rounded-xl text-[#D70F24] text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
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
                                    {t('auth.registerPage.registering')}
                                </>
                            ) : (
                                t('auth.registerPage.registerButton')
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-6 pb-6 text-center">
                        <p className="text-sm text-secondary">
                            {t('auth.registerPage.alreadyHaveAccount')}{' '}
                            <Link
                                href={`/login?next=${encodeURIComponent(nextUrl)}`}
                                className="text-[#D70F24] hover:underline font-medium"
                            >
                                {t('auth.registerPage.loginLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

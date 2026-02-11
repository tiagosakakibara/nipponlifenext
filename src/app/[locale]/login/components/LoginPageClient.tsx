"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing'; // Use localized Link
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export function LoginPageClient() {
    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get return URL from query params, default to community dashboard with locale prefix
    const nextUrl = searchParams.get('next') || `/${locale}/comunidade`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError(t('auth.loginPage.errors.fillFields'));
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                // Map specific error messages
                if (authError.message.includes('Invalid login')) {
                    setError(t('auth.loginPage.errors.invalidLogin'));
                } else if (authError.message.includes('Email logins are disabled')) {
                    setError(t('auth.loginPage.errors.emailDisabled'));
                } else if (authError.message.includes('Email not confirmed')) {
                    setError(t('auth.loginPage.errors.emailNotConfirmed'));
                } else {
                    setError(authError.message);
                }
                setLoading(false);
                return;
            }

            // Login success: keep spinner active during navigation so the user
            // sees clear feedback. The component will unmount on arrival.
            window.location.href = nextUrl;
        } catch (err) {
            console.error('[Login] Unexpected error:', err);
            setError(t('auth.loginPage.errors.unexpected'));
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google') => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('[Login] Social auth error:', err);
            setError(err.message || t('auth.loginPage.errors.socialAuth'));
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-app rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#003768] to-[#5593C3] text-center">
                        <h1 className="text-xl font-bold text-white">{t('auth.loginPage.title')}</h1>
                        <p className="text-white/70 text-sm mt-1">
                            {t('auth.loginPage.subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.loginPage.emailLabel')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.loginPage.emailPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.loginPage.passwordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('auth.loginPage.passwordPlaceholder')}
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
                                    {t('auth.loginPage.loggingIn')}
                                </>
                            ) : (
                                t('auth.loginPage.loginButton')
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-6 pb-6 text-center">
                        <div className="mt-4 mb-4 relative">
                            <div className="text-center mb-2">
                                <span className="text-muted text-[13px] font-medium uppercase tracking-wider">
                                    {t('auth.loginPage.socialLoginPrompt')}
                                </span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-800"></div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-app rounded-xl bg-app hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-primary text-sm font-medium"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 4.63c1.69 0 3.26.58 4.54 1.8l3.29-3.29C17.45 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>

                        <p className="text-sm text-secondary">
                            {t('auth.loginPage.noAccount')}{' '}
                            <Link
                                href={`/cadastro?next=${encodeURIComponent(nextUrl)}`}
                                className="text-[#D70F24] hover:underline font-medium"
                            >
                                {t('auth.loginPage.createAccount')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

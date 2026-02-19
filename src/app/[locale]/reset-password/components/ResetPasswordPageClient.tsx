"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResetPasswordPageClient() {
    const t = useTranslations();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Verify if we have a session (handled by auth/callback)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, the link might be invalid or expired, 
                // or the user navigated here directly without the email link.
                setError(t('auth.resetPassword.errors.noSession'));
            }
        };
        checkSession();
    }, [t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirmPassword) {
            setError(t('auth.resetPassword.errors.fillFields'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.resetPassword.errors.passwordsDontMatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.resetPassword.errors.passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            console.error('[Reset Password] Unexpected error:', err);
            setError(t('auth.resetPassword.errors.unexpected'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center py-12 px-4 min-h-[60vh]">
                <div className="w-full max-w-md">
                    <div className="bg-surface border border-app rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('auth.resetPassword.successTitle')}
                        </h2>
                        <p className="text-muted mb-4">
                            {t('auth.resetPassword.successMessage')}
                        </p>
                        <p className="text-sm text-muted">
                            {t('auth.resetPassword.redirecting')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12 px-4 min-h-[60vh]">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-app rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#003768] to-[#5593C3] text-center">
                        <h1 className="text-xl font-bold text-white">{t('auth.resetPassword.title')}</h1>
                        <p className="text-white/70 text-sm mt-1">
                            {t('auth.resetPassword.subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.resetPassword.newPasswordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.resetPassword.confirmPasswordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
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
                                    {t('auth.resetPassword.submitting')}
                                </>
                            ) : (
                                t('auth.resetPassword.submitButton')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

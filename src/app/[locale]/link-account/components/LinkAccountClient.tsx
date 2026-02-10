"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Loader2, AlertCircle, Link2, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { mergeAccountsAction, skipAccountLinkAction } from '@/app/actions/linkAccount';

interface Props {
    email: string;
}

export function LinkAccountClient({ email }: Props) {
    const t = useTranslations();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [merged, setMerged] = useState(false);

    const handleMerge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError(t('auth.linkAccount.errors.fillPassword'));
            return;
        }
        setLoading(true);
        setError(null);

        const result = await mergeAccountsAction(password);

        if (!result.success) {
            const errorMap: Record<string, string> = {
                wrong_password: t('auth.linkAccount.errors.wrongPassword'),
                session_expired: t('auth.linkAccount.errors.sessionExpired'),
                session_mismatch: t('auth.linkAccount.errors.sessionMismatch'),
                server_config: t('auth.linkAccount.errors.serverError'),
            };
            setError(errorMap[result.error ?? ''] ?? t('auth.linkAccount.errors.mergeFailed'));
            setLoading(false);
            return;
        }

        setMerged(true);
        setTimeout(() => {
            router.push('/comunidade');
            router.refresh();
        }, 2500);
    };

    const handleSkip = async () => {
        setLoading(true);
        await skipAccountLinkAction();
        router.push('/comunidade');
        router.refresh();
    };

    if (merged) {
        return (
            <div className="flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold font-display text-primary mb-3">
                        {t('auth.linkAccount.successTitle')}
                    </h2>
                    <p className="text-secondary text-sm leading-relaxed">
                        {t('auth.linkAccount.successSubtitle')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-app rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#003768] to-[#5593C3] text-center relative">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                            <Link2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">
                            {t('auth.linkAccount.title')}
                        </h1>
                        <p className="text-white/70 text-sm mt-1">
                            {t('auth.linkAccount.subtitle')}
                        </p>
                    </div>

                    {/* Info box */}
                    <div className="mx-6 mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                            {t('auth.linkAccount.description', { email })}
                        </p>
                    </div>

                    {/* What happens */}
                    <div className="mx-6 mt-4 space-y-2">
                        {(t.raw('auth.linkAccount.benefits') as string[]).map((benefit: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-secondary">{benefit}</p>
                            </div>
                        ))}
                    </div>

                    {/* Password form */}
                    <form onSubmit={handleMerge} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.linkAccount.passwordLabel')}
                            </label>
                            <p className="text-xs text-muted mb-2">
                                {t('auth.linkAccount.passwordHint', { email })}
                            </p>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-[#D70F24]/10 border border-[#D70F24]/30 rounded-xl text-[#D70F24] text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Merge button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#D70F24] hover:bg-[#b80d1f] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('auth.linkAccount.merging')}
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4" />
                                    {t('auth.linkAccount.mergeButton')}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Skip option */}
                    <div className="px-6 pb-6">
                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-app"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-surface px-3 text-xs text-muted uppercase tracking-wider">
                                    {t('auth.linkAccount.orSeparator')}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={loading}
                            className="w-full py-2.5 border border-app rounded-xl text-sm text-secondary hover:text-primary hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            {t('auth.linkAccount.skipButton')}
                        </button>

                        <p className="text-xs text-muted text-center mt-3 leading-relaxed">
                            {t('auth.linkAccount.skipNote')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

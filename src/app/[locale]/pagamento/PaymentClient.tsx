"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';

export default function PaymentClient() {
    const t = useTranslations('payment');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/payment/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Add body if needed, e.g., plan details
                body: JSON.stringify({ plan: 'premium_monthly' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('errorMessage'));
            }

            const data = await response.json();

            // Check if mock mode or real session URL
            if (data.session_url) {
                if (data.session_url.startsWith('/')) {
                    // Mock redirect (local)
                    router.push(data.session_url);
                } else {
                    // Real redirect (Komoju)
                    window.location.href = data.session_url;
                }
            } else {
                throw new Error('No session URL returned');
            }

        } catch (error: any) {
            console.error('Payment error:', error);
            alert(error.message || t('errorMessage'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-app rounded-2xl p-8 max-w-lg w-full mx-auto shadow-sm">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-[#5593C3]" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">{t('title')}</h2>
                <p className="text-secondary">{t('description')}</p>
            </div>

            <div className="space-y-6">
                {/* Order Summary Mock */}
                <div className="bg-app/50 rounded-xl p-4 border border-app">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-primary">{t('planName')}</span>
                        <span className="font-bold text-primary">¥ 1,000</span>
                    </div>
                    <div className="h-px bg-app my-2"></div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-primary">{t('total')}</span>
                        <span className="font-bold text-[#D70F24]">¥ 1,000</span>
                    </div>
                </div>

                {/* Komoju Branding/Info */}
                <div className="flex items-center justify-center gap-2 text-xs text-secondary/70">
                    <Lock className="w-3 h-3" />
                    <span>{t('securePayment')}</span>
                    <span className="font-bold">KOMOJU</span>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-4 bg-[#D70F24] hover:bg-[#b00c1d] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('processing')}
                        </>
                    ) : (
                        t('payButton')
                    )}
                </button>
            </div>

            <p className="mt-6 text-center text-xs text-secondary/50 max-w-xs mx-auto">
                {t('disclaimer')}
            </p>
        </div>
    );
}

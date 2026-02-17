"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PaymentReturnClient() {
    const t = useTranslations('payment');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                return;
            }

            try {
                // In a production app, your backend would check the session status with Komoju
                // and update the user's role/subscription status.
                // const response = await fetch(`/api/payment/verify-session?session_id=${sessionId}`);

                // For now, we'll simulate the verification
                await new Promise(resolve => setTimeout(resolve, 2000));

                // If OK, go to success
                router.replace('/pagamento/sucesso');
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [sessionId, router]);

    if (status === 'error') {
        return (
            <div className="bg-surface border border-app rounded-2xl p-8 max-w-lg w-full mx-auto shadow-sm text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">Erro na Verificação</h2>
                <p className="text-secondary mb-6">Não conseguimos confirmar seu pagamento. Se houve cobrança, entre em contato com o suporte.</p>
                <button
                    onClick={() => router.push('/pagamento')}
                    className="w-full py-3 bg-app border border-app rounded-xl font-bold hover:bg-surface-hover"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-app rounded-2xl p-8 max-w-lg w-full mx-auto shadow-sm text-center">
            <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-2">Verificando Pagamento</h2>
            <p className="text-secondary italic">Aguarde um momento enquanto confirmamos a transação com o Komoju...</p>
        </div>
    );
}

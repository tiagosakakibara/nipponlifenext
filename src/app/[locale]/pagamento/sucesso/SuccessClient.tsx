"use client";

import { useTranslations } from 'next-intl';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PaymentSuccessClient() {
    const t = useTranslations('payment.success');

    return (
        <div className="bg-surface border border-app rounded-2xl p-8 max-w-lg w-full mx-auto shadow-sm text-center">
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-primary mb-3">
                    {t('title', { defaultValue: 'Pagamento Confirmado!' })}
                </h2>
                <p className="text-secondary text-lg">
                    {t('description', { defaultValue: 'Parabéns! Sua assinatura Premium foi ativada com sucesso.' })}
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-app/50 rounded-xl p-6 border border-app text-left">
                    <h3 className="font-bold text-primary mb-2">
                        {t('nextStepsTitle', { defaultValue: 'O que você ganha agora:' })}
                    </h3>
                    <ul className="space-y-2 text-secondary text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            {t('benefit1', { defaultValue: 'Acesso antecipado a novas vagas' })}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            {t('benefit2', { defaultValue: 'Visibilidade para empresas premium' })}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            {t('benefit3', { defaultValue: 'Suporte prioritário na comunidade' })}
                        </li>
                    </ul>
                </div>

                <Link
                    href="/"
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:opacity-90 mt-6"
                >
                    {t('backToHome', { defaultValue: 'Voltar para o Início' })}
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}

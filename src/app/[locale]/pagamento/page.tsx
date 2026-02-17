import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PaymentClient from './PaymentClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'payment' });

    return {
        title: `${t('title')} - NipponLife`,
        description: t('description'),
    };
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-app flex items-center justify-center p-6">
            <PaymentClient />
        </div>
    );
}

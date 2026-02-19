import { getTranslations } from 'next-intl/server';
import { ForgotPasswordPageClient } from './components/ForgotPasswordPageClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('auth.forgotPassword.title')} | NipponLife`,
        description: t('auth.forgotPassword.subtitle'),
    };
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordPageClient />;
}

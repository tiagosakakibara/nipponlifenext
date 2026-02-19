import { getTranslations } from 'next-intl/server';
import { ResetPasswordPageClient } from './components/ResetPasswordPageClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('auth.resetPassword.title')} | NipponLife`,
        description: t('auth.resetPassword.subtitle'),
    };
}

export default function ResetPasswordPage() {
    return <ResetPasswordPageClient />;
}

import { getTranslations } from 'next-intl/server';
import { LoginPageClient } from './components/LoginPageClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('auth.loginPage.title')} | NipponLife`,
        description: t('auth.loginPage.subtitle'),
    };
}

export default function LoginPage() {
    return <LoginPageClient />;
}

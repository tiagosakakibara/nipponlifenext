import { getTranslations } from 'next-intl/server';
import { RegisterPageClient } from './components/RegisterPageClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('auth.registerPage.title')} | NipponLife`,
        description: t('auth.registerPage.subtitle'),
    };
}

export default function RegisterPage() {
    return <RegisterPageClient />;
}

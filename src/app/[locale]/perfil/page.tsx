import { getTranslations } from 'next-intl/server';
import { ProfilePageClient } from './components/ProfilePageClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('auth.profile.title')} | NipponLife`,
        description: t('auth.profile.metaDescription'),
    };
}

export default function ProfilePage() {
    return <ProfilePageClient />;
}

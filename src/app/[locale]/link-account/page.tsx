import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/metadata';
import { LinkAccountClient } from './components/LinkAccountClient';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return generateSEOMetadata({
        title: t('auth.linkAccount.pageTitle'),
        description: t('auth.linkAccount.pageDescription'),
        locale,
        url: '/link-account',
    });
}

export default async function LinkAccountPage({ params }: Props) {
    const { locale } = await params;

    const cookieStore = await cookies();
    const raw = cookieStore.get('pending_account_link')?.value;

    if (!raw) {
        redirect(`/${locale}/`);
    }

    let pendingLink: { email: string; expiresAt: number };
    try {
        pendingLink = JSON.parse(raw);
    } catch {
        redirect(`/${locale}/`);
    }

    if (Date.now() > pendingLink.expiresAt) {
        redirect(`/${locale}/`);
    }

    return <LinkAccountClient email={pendingLink.email} />;
}

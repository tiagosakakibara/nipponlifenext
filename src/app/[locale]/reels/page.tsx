import { fetchActiveReels } from '@/lib/reelsService';
import ReelsPageClient from './ReelsPageClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'community' });

    return {
        title: `Reels | NipponLife`,
        description: t('subtitle')
    };
}

export const revalidate = 60; // Revalidate every minute

export default async function ReelsPage() {
    const reels = await fetchActiveReels();

    return <ReelsPageClient reels={reels} />;
}

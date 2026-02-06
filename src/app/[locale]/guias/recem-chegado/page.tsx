import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import GuideHeroSection from './components/GuideHeroSection';
import GuideCategoryGrid from './components/GuideCategoryGrid';
import CommunityRecommendations from './components/CommunityRecommendations';
import FinalCTASection from './components/FinalCTASection';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('guides.hero.title')} | NipponLife`,
        description: t('guides.hero.description'),
    };
}

export default async function NewcomerGuidePage({ params }: Props) {
    const { locale } = await params;

    return (
        <main>
            {/* Hero Section */}
            <GuideHeroSection locale={locale} />

            {/* Category Grid */}
            <GuideCategoryGrid locale={locale} />

            {/* Community Recommendations */}
            <CommunityRecommendations locale={locale} />

            {/* Final CTA */}
            <FinalCTASection locale={locale} />
        </main>
    );
}

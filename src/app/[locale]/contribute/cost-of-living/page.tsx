import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CostOfLivingForm from './components/CostOfLivingForm';
import { getTranslations } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'community.costOfLiving' });
    return {
        title: `${t('title')} | NipponLife`,
        description: t('subtitle')
    };
}

export default async function Page({ params }: Props) {
    const { locale } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
        return null;
    }

    return (
        <main className="min-h-screen bg-app py-12 px-4 md:px-8">
            <CostOfLivingForm locale={locale} userId={user.id} />
        </main>
    );
}

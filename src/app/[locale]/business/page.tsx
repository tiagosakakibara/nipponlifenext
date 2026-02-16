import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { BusinessDirectory } from './BusinessDirectory';
import { Business } from '@/types/business';
import { Filter } from 'lucide-react';
import BusinessAccessButton from './BusinessAccessButton';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('business.title', { defaultMessage: 'Guia de Empresas' })} | NipponLife`,
        description: t('business.subtitle', { defaultMessage: 'Encontre os melhores serviços e empresas no Japão.' }),
    };
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export default async function BusinessPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { search, category, city } = await searchParams;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    let query = supabase
        .from('businesses')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false }) // Featured first
        .order('created_at', { ascending: false });

    if (category && typeof category === 'string') {
        const cat = decodeURIComponent(category);
        if (cat !== 'Todas' && cat !== '') {
            query = query.eq('category', cat);
        }
    }

    if (city && typeof city === 'string') {
        const c = decodeURIComponent(city);
        query = query.or(`city.ilike.%${c}%,prefecture.ilike.%${c}%,city_ja.ilike.%${c}%,prefecture_ja.ilike.%${c}%`);
    }

    if (search && typeof search === 'string') {
        const s = decodeURIComponent(search);
        query = query.or(`business_name.ilike.%${s}%,description_short.ilike.%${s}%,business_name_ja.ilike.%${s}%,description_short_ja.ilike.%${s}%`);
    }

    const { data: businesses } = await query;

    return (
        <main className="min-h-screen bg-app">
            {/* Hero Section - Standard Pattern */}
            <section className="relative min-h-[130px] pt-12 pb-6 flex items-center overflow-hidden bg-surface border-b border-app">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-primary tracking-tight leading-[1.1]">
                            {t('business.directoryTitlePart1', { defaultMessage: 'Encontre os' })} <span className="text-[#D70F24]">{t('business.directoryTitleHighlight', { defaultMessage: 'Melhores Serviços' })}</span> {t('business.directoryTitlePart2', { defaultMessage: 'no Japão' })}
                        </h1>
                        <BusinessAccessButton />
                    </div>
                </div>
            </section>

            <BusinessDirectory businesses={(businesses as Business[]) || []} />
        </main>
    );
}

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { BusinessDirectory } from './BusinessDirectory';
import { Business } from '@/types/business';

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
            {/* Hero */}
            <div className="relative bg-surface h-[136px] flex items-center px-4 overflow-hidden border-b border-app">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D70F24]/5 to-indigo-900/5 dark:from-[#D70F24]/10 dark:to-indigo-900/10 pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 text-center w-full">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-[#003768] tracking-tighter">
                        {t('business.directoryTitlePart1', { defaultMessage: 'Encontre os' })} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D70F24] via-[#E63946] to-[#FF4D6D]">{t('business.directoryTitleHighlight', { defaultMessage: 'melhores serviços' })}</span> {t('business.directoryTitlePart2', { defaultMessage: 'no Japão' })}
                    </h1>
                </div>
            </div>

            <BusinessDirectory businesses={(businesses as Business[]) || []} />
        </main>
    );
}

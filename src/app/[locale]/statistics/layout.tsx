import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    return generateSEOMetadata({
        title: t('statistics.seo.title', { defaultValue: 'Estatísticas do Japão' }),
        description: t('statistics.seo.description', {
            defaultValue: 'Dados e estatísticas sobre população estrangeira, salários, turismo e custo de vida no Japão.',
        }),
        locale,
        url: '/statistics',
        images: ['/images/statistics-placeholder.png'],
    });
}

export default function StatisticsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

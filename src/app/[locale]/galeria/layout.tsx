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
        title: t('gallery.seo.title', { defaultValue: 'Galeria de Fotos do Japão' }),
        description: t('gallery.seo.description', {
            defaultValue: 'Explore nossa galeria com álbuns fotográficos da cultura japonesa, paisagens e vida cotidiana no Japão.',
        }),
        locale,
        url: '/galeria',
        images: ['/images/logo-full.png'],
    });
}

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

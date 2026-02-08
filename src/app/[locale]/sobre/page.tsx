
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/metadata';
import Image from 'next/image';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'footer' });

    return generateSEOMetadata({
        title: `${t('about')} - NipponLife`,
        description: t('about'),
        locale,
        url: '/sobre',
    });
}

export default async function AboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // Use multilingual keys logic
    const key = locale === 'pt' ? 'about_us' : `about_us_${locale}`;

    // Fetch about content from settings
    const { data: setting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

    // Determine fallback to Portuguese if localized version is missing
    let finalContent = setting?.value;
    if (!finalContent && locale !== 'pt') {
        const { data: fallbackSetting } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'about_us')
            .single();
        finalContent = fallbackSetting?.value;
    }

    // Fallback content if not found in database
    const content = finalContent || (
        <div className="prose prose-lg dark:prose-invert max-w-none text-[var(--nl-text-primary)]">
            <p className="lead text-xl text-[var(--nl-secondary)] mb-6">
                O NipponLife é o seu portal completo para viver no Japão, conectando a comunidade brasileira e estrangeira com oportunidades, cultura e informação.
            </p>

            <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
            <p>
                Nossa missão é facilitar a vida dos estrangeiros no Japão, fornecendo informações precisas,
                oportunidades de emprego confiáveis e uma plataforma para conexão comunitária.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">O que oferecemos</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li>Notícias atualizadas sobre o Japão</li>
                <li>Diretório de empresas e serviços</li>
                <li>Vagas de emprego em diversas áreas</li>
                <li>Guia completo para recém-chegados</li>
                <li>Comunidade ativa para troca de experiências</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Entre em Contato</h2>
            <p>
                Tem dúvidas ou sugestões? Entre em contato conosco através de nossos canais oficiais ou redes sociais.
            </p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-[var(--nl-primary)]">
                {t('footer.about')}
            </h1>

            <div className="bg-[var(--nl-card)] p-8 rounded-2xl border border-[var(--nl-border)] shadow-sm space-y-8">
                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-8">
                    <Image
                        src="/images/logo-full.png"
                        alt="NipponLife Team"
                        fill
                        className="object-contain p-8 bg-[var(--nl-bg-secondary)]"
                    />
                </div>

                {typeof content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-lg dark:prose-invert max-w-none text-[var(--nl-text-primary)]" />
                ) : (
                    content
                )}
            </div>
        </div>
    );
}

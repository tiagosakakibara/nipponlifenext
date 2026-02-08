
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'footer' });

    return generateSEOMetadata({
        title: `${t('terms')} - NipponLife`,
        description: t('terms'),
        locale,
        url: '/termos',
    });
}

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // Use multilingual keys logic
    const key = locale === 'pt' ? 'terms_of_service' : `terms_of_service_${locale}`;

    // Fetch terms content from settings
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
            .eq('key', 'terms_of_service')
            .single();
        finalContent = fallbackSetting?.value;
    }

    // Fallback content if not found in database
    const content = finalContent || (
        <div className="space-y-6 text-[var(--nl-text-primary)]">
            <p>
                Bem-vindo ao NipponLife. Ao acessar nosso site, você concorda em cumprir estes termos de serviço,
                todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Uso de Licença</h2>
            <p>
                É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site NipponLife,
                apenas para visualização transitória pessoal e não comercial.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Isenção de Responsabilidade</h2>
            <p>
                Os materiais no site da NipponLife são fornecidos 'como estão'. NipponLife não oferece garantias, expressas ou implícitas,
                e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Limitações</h2>
            <p>
                Em nenhum caso o NipponLife ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados
                ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em NipponLife.
            </p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-[var(--nl-primary)]">
                {t('footer.terms')}
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none bg-[var(--nl-card)] p-8 rounded-2xl border border-[var(--nl-border)] shadow-sm">
                <p className="text-[var(--nl-secondary)] mb-6">
                    Última atualização: {new Date().toLocaleDateString(locale)}
                </p>

                {typeof content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    content
                )}
            </div>
        </div>
    );
}

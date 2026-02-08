
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
        title: `${t('privacy')} - NipponLife`,
        description: t('privacy'),
        locale,
        url: '/privacidade',
    });
}

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // Use multilingual keys logic
    const key = locale === 'pt' ? 'privacy_policy' : `privacy_policy_${locale}`;

    // Fetch privacy content from settings
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
            .eq('key', 'privacy_policy')
            .single();
        finalContent = fallbackSetting?.value;
    }

    // Fallback content if not found in database
    const content = finalContent || (
        <div className="space-y-6 text-[var(--nl-text-primary)]">
            <p>
                Esta Política de Privacidade descreve como o NipponLife coleta, usa e protege suas informações pessoais.
                Ao utilizar nosso site, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Coleta e Uso de Informações</h2>
            <p>
                Coletamos diferentes tipos de informações para diversas finalidades, para fornecer e melhorar nosso serviço para você.
                Isso pode incluir dados de cadastro, preferências de navegação e interações com a comunidade.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Segurança dos Dados</h2>
            <p>
                A segurança dos seus dados é importante para nós, mas lembre-se que nenhum método de transmissão pela Internet
                ou método de armazenamento eletrônico é 100% seguro.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Cookies</h2>
            <p>
                Utilizamos cookies e tecnologias de rastreamento semelhantes para rastrear a atividade em nosso serviço e manter certas informações.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Contato</h2>
            <p>
                Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco.
            </p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-[var(--nl-primary)]">
                {t('footer.privacy')}
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

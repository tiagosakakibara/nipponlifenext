
import { getTranslations } from 'next-intl/server';
import FooterSettingsClient from './FooterSettingsClient';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    return {
        title: `${t('admin.menu.footer')} - Admin | NipponLife`,
    };
}

export default function FooterSettingsPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 min-h-screen">
            <FooterSettingsClient />
        </div>
    );
}

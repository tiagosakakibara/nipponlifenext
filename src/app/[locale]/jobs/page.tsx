import JobsClient from './JobsClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'jobs' });
    return {
        title: `${t('title')} | NipponLife`,
        description: t('subtitle'),
    };
}

export default function JobsPage() {
    return <JobsClient />;
}

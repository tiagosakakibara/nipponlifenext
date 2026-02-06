import JobsClient from './JobsClient';
import { getTranslations } from 'next-intl/server';

import { createClient } from '@/utils/supabase/server';
import { generateSEOMetadata } from '@/lib/metadata';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
    const { locale } = await params;
    const { selectedJobId } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'jobs' });

    // If specific job is selected via query param (e.g. for sharing)
    if (selectedJobId && typeof selectedJobId === 'string') {
        const supabase = await createClient();
        const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', selectedJobId)
            .single();

        if (job) {
            return generateSEOMetadata({
                title: job.title,
                description: job.company ? `${job.company} - ${job.location}` : t('subtitle'),
                locale,
                type: 'article',
                url: `/jobs?selectedJobId=${selectedJobId}`,
                images: job.cover_image_url ? [job.cover_image_url] : (job.logo_url ? [job.logo_url] : []),
            });
        }
    }

    return {
        title: `${t('title')} | NipponLife`,
        description: t('subtitle'),
    };
}

export default function JobsPage() {
    return <JobsClient />;
}

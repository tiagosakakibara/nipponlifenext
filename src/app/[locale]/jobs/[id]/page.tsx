
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import JobDetailsClient from './JobDetailsClient';
import { mapDbToJob } from '@/lib/jobsService';
import { generateSEOMetadata } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, id } = await params;
    const t = await getTranslations({ locale, namespace: 'jobs' });
    const supabase = await createClient();

    // Check if valid UUID to avoid postgres errors if slug is passed (though route is [id])
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return {
            title: `${t('title')} | NipponLife`,
        };
    }

    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (job) {
        return generateSEOMetadata({
            title: job.title,
            description: job.company_name ? `${job.company_name} - ${job.prefecture || job.location}` : t('subtitle'),
            locale,
            type: 'article',
            url: `/jobs/${id}`,
            images: job.cover_image_url ? [job.cover_image_url] : [],
        });
    }

    return {
        title: `${t('title')} | NipponLife`,
        description: t('subtitle'),
    };
}

export default async function JobPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        notFound();
    }

    const job = mapDbToJob(data);

    return <JobDetailsClient job={job} />;
}

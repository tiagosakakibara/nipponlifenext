import { Suspense } from 'react';
import EventsClient from './EventsClient';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'eventsCalendar' });

    return {
        title: `${t('title')} ${t('titleHighlight')} - NipponLife`,
        description: t('noEventsDescription'),
    };
}

export default function EventsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D70F24]"></div>
            </div>
        }>
            <EventsClient />
        </Suspense>
    );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eventService } from '@/lib/eventService';
import { storageService } from '@/lib/storageService';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Calendar, MapPin, Info } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { EventSidebar } from './components/EventSidebar';
import { generateSEOMetadata, generateEventSchema, generateBreadcrumbSchema } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';

// ISR: Revalidate every 5 minutes for event pages
export const revalidate = 300;

interface EventPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    const event = await eventService.getEventBySlug(slug);

    if (!event) return { title: 'Evento não encontrado' };

    const title = locale === 'ja' ? event.title_ja || event.title :
        locale === 'en' ? event.title_en || event.title :
            event.title;

    const description = locale === 'ja' ? event.description_ja || event.description :
        locale === 'en' ? event.description_en || event.description :
            event.description;

    return generateSEOMetadata({
        title,
        description: description?.substring(0, 160) || '',
        locale,
        type: 'article',
        url: `/eventos/${slug}`,
        images: event.cover_image_url ? [event.cover_image_url] : [],
    });
}

export default async function EventDetailPage({ params }: EventPageProps) {
    const { slug, locale } = await params;
    const t = await getTranslations('eventDetails');
    const ct = await getTranslations('common');

    let event = await eventService.getEventBySlug(slug);

    // Fallback if slug is actually a UUID
    if (!event && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        event = await eventService.getEventById(slug);
    }

    if (!event) notFound();

    const title = locale === 'ja' ? event.title_ja || event.title :
        locale === 'en' ? event.title_en || event.title :
            event.title;

    const locationName = locale === 'ja' ? event.location_ja || event.location :
        locale === 'en' ? event.location_en || event.location :
            event.location;

    const description = locale === 'ja' ? event.description_ja || event.description :
        locale === 'en' ? event.description_en || event.description :
            event.description;

    const date = new Date(event.starts_at);
    const dateStr = date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const coverUrl = storageService.getFileUrl(event.cover_image_url);

    // Generate JSON-LD schemas
    const eventSchema = generateEventSchema({
        name: title,
        description: description || '',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/eventos/${slug}`,
        image: event.cover_image_url || '',
        startDate: event.starts_at,
        endDate: event.ends_at || undefined,
        location: locationName || '',
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: ct('breadcrumb.home', { defaultValue: 'Home' }), url: `/${locale}` },
        { name: ct('events.title', { defaultValue: 'Eventos' }), url: `/${locale}/eventos` },
        { name: title, url: `/${locale}/eventos/${slug}` },
    ]);

    return (
        <main className="min-h-screen bg-white">
            <StructuredData data={eventSchema} />
            <StructuredData data={breadcrumbSchema} />
            {/* Header / Hero Area */}
            <div className="relative h-[32vh] md:h-[40vh] min-h-[320px] w-full overflow-hidden">
                {event.cover_image_url ? (
                    <>
                        {/* Background blurred */}
                        <div className="absolute inset-0">
                            <img
                                src={coverUrl}
                                alt=""
                                className="w-full h-full object-cover blur-2xl scale-110 opacity-50"
                            />
                        </div>
                        {/* Main Image */}
                        <img
                            src={coverUrl}
                            alt={title}
                            className="w-full h-full object-contain relative z-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/30 z-20" />
                    </>
                ) : (
                    <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-zinc-100" />
                    </div>
                )}

                <div className="absolute top-32 left-0 w-full z-30">
                    <div className="container mx-auto px-6">
                        <Link
                            href="/eventos"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/40 transition-all mb-8 shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToCalendar')}
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full pb-12 z-30">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D70F24] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                <Info className="w-3 h-3" />
                                {ct('event')}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary tracking-tight leading-tight">
                                {title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#D70F24] rounded-full" />
                                <h3 className="text-xl font-heading font-bold text-primary tracking-tight uppercase">{locale === 'pt' ? 'Descrição' : 'Description'}</h3>
                            </div>
                            <div className="text-lg text-secondary font-medium leading-relaxed whitespace-pre-line prose prose-zinc max-w-none">
                                {description || t('noDescription')}
                            </div>
                        </section>

                        {event.google_maps_url && event.location && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    <h3 className="text-xl font-heading font-bold text-primary tracking-tight uppercase">{t('location')}</h3>
                                </div>
                                <div className="rounded-[40px] overflow-hidden border border-zinc-100 shadow-xl bg-zinc-50 p-2">
                                    <div className="bg-white rounded-[32px] p-8 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#D70F24]">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{t('location')}</p>
                                                <p className="text-lg font-bold text-primary">{locationName}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={event.google_maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-4 bg-zinc-100 hover:bg-zinc-200 text-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
                                        >
                                            Abrir no Google Maps
                                        </a>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <EventSidebar
                            contactUrl={event.contact_url}
                            viewCount={event.view_count}
                            dateStr={dateStr}
                            title={title}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

import { notFound, redirect } from 'next/navigation';
import { eventService } from '@/lib/eventService';

export default async function EventIdPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const event = await eventService.getEventById(id);

    if (!event) notFound();

    if (event.slug) {
        redirect(`/${locale}/eventos/${event.slug}`);
    }

    // If no slug, we can show the details here or redirect to a slugified version if we had one
    // But since we want consistent URLs, let's just redirect to the slug if it exists.
    // If it doesn't exist, we can't redirect, so we'd have to show the content or redirect to a fallback.

    // For now, let's just redirect to the slug. If there's no slug, we might want to generate one or just use the ID.
    // The detail page [slug] already handles ID fallback if not found by slug.

    redirect(`/${locale}/eventos/${id}`);
}

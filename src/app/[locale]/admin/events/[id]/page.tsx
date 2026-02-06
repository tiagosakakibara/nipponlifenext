"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { eventService } from '@/lib/eventService';
import { Event } from '@/types/event';
import AdminEventFormClient from '../AdminEventFormClient';
import { Loader2 } from 'lucide-react';

export default function AdminEventEditPage() {
    const params = useParams();
    const id = params.id as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await eventService.getEventById(id);
                setEvent(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
            </div>
        );
    }

    if (!event) {
        return <div className="p-8 text-center text-secondary">Evento não encontrado.</div>;
    }

    return <AdminEventFormClient id={id} initialData={event} />;
}

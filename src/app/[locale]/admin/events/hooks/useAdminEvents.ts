"use client";

import { useState, useCallback } from 'react';
import { eventService } from '@/lib/eventService';
import { Event } from '@/types/event';
import { toast } from 'react-hot-toast';

export function useAdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const fetchEvents = useCallback(async (currentPage: number, search?: string) => {
        setLoading(true);
        try {
            const { data, count } = await eventService.getAdminEvents(currentPage, ITEMS_PER_PAGE, search);
            setEvents(data);
            setTotalCount(count || 0);
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            } else {
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteEvent = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este evento?')) return false;

        try {
            await eventService.deleteEvent(id);
            toast.success('Evento excluído com sucesso');
            fetchEvents(page);
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Erro ao excluir evento');
            return false;
        }
    };

    return {
        events,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        fetchEvents,
        deleteEvent
    };
}

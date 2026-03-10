import { supabase } from './supabaseClient';
import { Event, EventFilters, EventsResponse } from '../types/event';

const DB_TABLE = 'calendar_events';

export const eventService = {
    // --- Public methods ---

    async getEventsPaged({
        search = '',
        month,
        year,
        limit = 20,
        offset = 0
    }: EventFilters): Promise<EventsResponse> {
        let query = supabase
            .from(DB_TABLE)
            .select('id, title, slug, location, starts_at, ends_at, description, cover_image_url, google_maps_url', { count: 'exact' });

        if (search.trim()) {
            query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
        }

        let startDate: string | undefined;
        let endDate: string | undefined;
        const filterYear = year || (month ? new Date().getFullYear() : undefined);

        if (filterYear) {
            if (month) {
                const start = new Date(filterYear, month - 1, 1);
                const end = new Date(filterYear, month, 1);
                startDate = start.toISOString();
                endDate = end.toISOString();
            } else {
                const start = new Date(filterYear, 0, 1);
                const end = new Date(filterYear + 1, 0, 1);
                startDate = start.toISOString();
                endDate = end.toISOString();
            }

            query = query
                .gte('starts_at', startDate)
                .lt('starts_at', endDate);
        }

        // Hide events that have already passed
        const nowIso = new Date().toISOString();
        const twelveHoursAgoIso = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        query = query.or(`ends_at.gte.${nowIso},and(ends_at.is.null,starts_at.gte.${twelveHoursAgoIso})`);

        query = query
            .order('starts_at', { ascending: true })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            throw error;
        }

        return {
            events: data as Event[],
            hasMore: (count || 0) > offset + limit,
            total: count || 0
        };
    },

    async getEventBySlug(slug: string): Promise<Event | null> {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data as Event;
    },

    // --- Admin methods ---

    async getAdminEvents(page = 1, limit = 20, search?: string) {
        let query = supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
        }

        query = query.order('starts_at', { ascending: false });

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;
        return { data: data as Event[], count };
    },

    async getEventById(id: string): Promise<Event | null> {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Event;
    },

    async createEvent(data: any) {
        const { data: newEvent, error } = await supabase
            .from(DB_TABLE)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return newEvent as Event;
    },

    async updateEvent(id: string, data: any) {
        const { data: updated, error } = await supabase
            .from(DB_TABLE)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated as Event;
    },

    async deleteEvent(id: string) {
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

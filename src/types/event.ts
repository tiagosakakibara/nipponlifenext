// Mapped to Supabase table: calendar_events
export interface Event {
    id: string;
    title: string;
    slug: string | null;
    location: string | null;
    starts_at: string; // timestamptz ISO string
    ends_at: string | null; // timestamptz
    cover_image_url?: string | null; // Matches Supabase field
    description?: string; // Keeping description as optional fallback
    google_maps_url?: string | null;
    // Translation fields
    title_ja?: string | null;
    title_en?: string | null;
    location_ja?: string | null;
    location_en?: string | null;
    description_ja?: string | null;
    description_en?: string | null;
    contact_url?: string | null;
    view_count?: number;
    status: 'draft' | 'published';
    created_at?: string;
    updated_at?: string;
}

export interface EventsResponse {
    events: Event[];
    hasMore: boolean;
    total: number;
}

export interface EventFilters {
    search?: string;
    month?: number; // 1-12
    year?: number;
    limit?: number;
    offset?: number;
}

import { supabase } from '@/lib/supabaseClient';
import { storageService } from '@/lib/storageService';

// Types
export interface CommunityReel {
    id: string;
    title: string | null;
    url: string;
    provider: 'youtube' | 'image' | 'unknown';
    youtube_video_id: string | null;
    thumbnail_url: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ReelFormData {
    title?: string | null;
    url: string;
    thumbnail_url?: string | null;
    is_active?: boolean;
    sort_order?: number;
}

export interface ReelFilters {
    search?: string;
    provider?: 'youtube' | 'image' | 'all';
    status?: 'active' | 'inactive' | 'all';
    sortBy?: 'sort_order' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}

// URL Parsing utilities
interface ParsedReelUrl {
    provider: 'youtube' | 'image' | 'unknown';
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
    isValid: boolean;
    errorMessage?: string;
}

/**
 * Parse a URL to detect provider type and extract relevant info
 */
export function parseReelUrl(url: string): ParsedReelUrl {
    const trimmedUrl = url.trim();

    // Check for YouTube URLs
    const youtubePatterns = [
        // youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
        // youtu.be/VIDEO_ID
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        // youtube.com/shorts/VIDEO_ID
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
        const match = trimmedUrl.match(pattern);
        if (match && match[1]) {
            const videoId = match[1];
            return {
                provider: 'youtube',
                youtubeVideoId: videoId,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                isValid: true,
            };
        }
    }

    // Check for image URLs by extension
    const imageExtensions = /\.(jpg|jpeg|png|webp)(\?.*)?$/i;
    if (imageExtensions.test(trimmedUrl)) {
        return {
            provider: 'image',
            youtubeVideoId: null,
            thumbnailUrl: trimmedUrl,
            isValid: true,
        };
    }

    // Unknown provider
    return {
        provider: 'unknown',
        youtubeVideoId: null,
        thumbnailUrl: null,
        isValid: false,
        errorMessage: 'Link inválido. Use YouTube/Shorts ou URL direta de imagem (jpg/png/webp).',
    };
}

/**
 * Fetch active reels for public display
 */
export async function fetchActiveReels(limit?: number): Promise<CommunityReel[]> {
    let query = supabase
        .from('community_reels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching active reels:', error);
        return [];
    }

    return data || [];
}

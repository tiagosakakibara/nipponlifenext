interface StaticMapOptions {
    query: string;
    width?: number;
    height?: number;
    zoom?: number;
    apiKey?: string;
}

/**
 * Returns a Google Static Maps URL for a given address/query.
 * Requires a valid API Key.
 */
export function getStaticMapUrl({
    query,
    width = 640,
    height = 360,
    zoom = 15,
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
}: StaticMapOptions): string | null {
    if (!apiKey || !query) return null;

    const encodedQuery = encodeURIComponent(query);
    // scale=2 for high DPI screens
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedQuery}&zoom=${zoom}&size=${width}x${height}&scale=2&markers=color:red%7C${encodedQuery}&key=${apiKey}`;
}

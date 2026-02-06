/**
 * Generates a URL-safe slug from a string.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
        .slice(0, 60); // Max length
}

/**
 * Generates a random suffix for slug collision handling.
 */
export function generateSlugSuffix(): string {
    return Math.random().toString(36).substring(2, 6);
}

/**
 * Generates a slug with optional suffix for collision handling.
 */
export function slugifyWithSuffix(text: string, suffix?: string): string {
    const baseSlug = slugify(text);
    return suffix ? `${baseSlug}-${suffix}` : baseSlug;
}

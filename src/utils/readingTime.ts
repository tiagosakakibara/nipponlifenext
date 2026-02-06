/**
 * Calculates the estimated reading time for a news article or guide.
 * Standard reading speed is generally considered to be around 200-250 words per minute.
 * We'll use 225 words per minute as a balanced average.
 * 
 * @param content The HTML or text content of the article
 * @returns A localized string string representing the reading time (e.g., "5 min de leitura")
 */
export function calculateReadingTime(content: string | null | undefined): string {
    if (!content) return '1 min de leitura';

    // Remove HTML tags to get the actual text
    const text = content.replace(/<[^>]*>/g, '');

    // Count words (splitting by whitespace)
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate minutes (225 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 225);

    // Ensure at least 1 minute
    const minutes = Math.max(1, readingTimeMinutes);

    return `${minutes} min de leitura`;
}

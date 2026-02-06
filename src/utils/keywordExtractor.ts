
// Basic list of Portuguese stopwords
const STOP_WORDS_PT = new Set([
    'a', 'as', 'o', 'os', 'ao', 'aos', 'à', 'às', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'na', 'no', 'um', 'uma', 'uns', 'umas',
    'e', 'ou', 'mas', 'se', 'que', 'como', 'quando', 'onde', 'porque', 'quem',
    'é', 'era', 'foi', 'ser', 'estar', 'está', 'estava', 'são', 'ter', 'tem', 'tinha', 'haver', 'há',
    'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes',
    'meu', 'teu', 'seu', 'nosso', 'vosso', 'minha', 'sua', 'nossa', 'vossa',
    'muito', 'pouco', 'mais', 'menos', 'tão', 'quão', 'todo', 'toda', 'todos', 'todas', 'tudo', 'nada',
    'isso', 'isto', 'aquilo', 'esse', 'essa', 'este', 'esta', 'aquele', 'aquela',
    'com', 'sem', 'sobre', 'entre', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'
]);

// Basic list of English stopwords
const STOP_WORDS_EN = new Set([
    'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
    'so', 'than', 'then', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now', 'this', 'that', 'these', 'those'
]);

export function extractKeywords(text: string, count: number = 5): string[] {
    if (!text) return [];

    // 1. Clean HTML tags if present (simple regex match)
    const plainText = text.replace(/<[^>]*>/g, ' ');

    // 2. Normalize: lowercase, replace newlines/tabs with space
    const normalized = plainText.toLowerCase().replace(/[\r\n\t]/g, ' ');

    // 3. Remove punctuation and special characters (keep only letters and numbers)
    // Allowing accented characters for Portuguese
    const cleaned = normalized.replace(/[^\w\s\u00C0-\u00FF]/g, ' ');

    // 4. Split into words
    const words = cleaned.split(/\s+/);

    // 5. Filter words
    const filteredWords = words.filter(word => {
        // Remove if empty or too short
        if (word.length < 3) return false;
        // Remove numbers (unless alphanumeric)
        if (/^\d+$/.test(word)) return false;
        // Remove stopwords
        if (STOP_WORDS_PT.has(word)) return false;
        if (STOP_WORDS_EN.has(word)) return false;

        return true;
    });

    // 6. Count frequencies
    const frequencies: Record<string, number> = {};
    filteredWords.forEach(word => {
        frequencies[word] = (frequencies[word] || 0) + 1;
    });

    // 7. Sort by frequency desc
    const sortedWords = Object.keys(frequencies).sort((a, b) => {
        return frequencies[b] - frequencies[a];
    });

    // 8. Return top N unique
    return sortedWords.slice(0, count);
}

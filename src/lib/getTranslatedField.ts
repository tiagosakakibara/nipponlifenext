/**
 * Utilitário para obter campos traduzidos baseado no idioma atual
 * Suporta: pt-BR (base), ja-JP, en-US
 */

type LanguageCode = 'pt-BR' | 'ja-JP' | 'en-US' | string;

/**
 * Retorna o valor traduzido de um campo baseado no idioma
 * 
 * @param item - Objeto contendo os campos (ex: post, job, event)
 * @param field - Nome do campo base (ex: 'title', 'excerpt', 'content')
 * @param language - Código do idioma (ex: 'ja-JP', 'en-US')
 * @returns O valor traduzido ou fallback para PT-BR
 * 
 * @example
 * getTranslatedField(post, 'title', 'ja-JP') 
 * // Retorna post.title_ja se existir, senão post.title
 */
export function getTranslatedField(
    item: Record<string, any>,
    field: string,
    language: LanguageCode
): string {
    if (!item) return '';

    // Mapeia idioma para sufixo do campo
    const suffixMap: Record<string, string> = {
        'ja-JP': '_ja',
        'ja': '_ja',
        'en-US': '_en',
        'en': '_en',
        'pt-BR': '',
        'pt': '',
    };

    // Tenta encontrar o sufixo exato ou pelo prefixo (ex: 'ja-JP' -> 'ja')
    let suffix = suffixMap[language];
    if (suffix === undefined) {
        const shortLang = language.split('-')[0];
        suffix = suffixMap[shortLang] || '';
    }

    // Se não for PT-BR, tenta buscar campo traduzido
    if (suffix) {
        const translatedField = `${field}${suffix}`;
        const translatedValue = item[translatedField];

        // Retorna tradução se existir e não for vazio
        if (translatedValue && translatedValue.trim() !== '') {
            return translatedValue;
        }
    }

    // Fallback: retorna campo base (PT-BR)
    return item[field] || '';
}

/**
 * Verifica se existe tradução para um campo específico
 */
export function hasTranslation(
    item: Record<string, any>,
    field: string,
    language: LanguageCode
): boolean {
    const suffixMap: Record<string, string> = {
        'ja-JP': '_ja',
        'en-US': '_en',
    };

    const suffix = suffixMap[language];
    if (!suffix) return true; // PT-BR sempre tem (é o base)

    const translatedField = `${field}${suffix}`;
    const value = item[translatedField];

    return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * Normaliza o slug de uma categoria para uso em traduções
 * Remove acentos e converte para minúsculas
 * 
 * @example
 * normalizeCategorySlug('Notícias') // 'noticias'
 * normalizeCategorySlug('COMUNIDADES') // 'comunidades'
 */
export function normalizeCategorySlug(slug: string | undefined | null): string {
    if (!slug) return '';

    // First normalize: lowercase and remove accents
    const normalized = slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Map Portuguese category names to English keys
    const categoryMap: Record<string, string> = {
        'noticias': 'news',
        'noticia': 'news',
        'comunidades': 'communities',
        'comunidade': 'communities',
        'eventos': 'events',
        'evento': 'events',
        'vagas': 'jobs',
        'vaga': 'jobs',
        'negocios': 'business',
        'negocio': 'business',
        // 'trabalho', 'cultura', 'visto' etc removed to preserve original slug which matches i18n keys
        'idioma': 'language',
        'dicas do ceo': 'dicas-do-ceo', // Fixed: matches i18n key 'dicas-do-ceo'
        'avisos governamentais': 'avisos-governamentais', // Fixed: matches i18n key 'avisos-governamentais'
        'nihongo class': 'nihongo', // Fixed: matches i18n key 'nihongo'
        'negocios premium': 'business_premium',
    };

    return categoryMap[normalized] || normalized;
}

/**
 * Extrai a chave de tradução normalizada de uma categoria
 * Funciona com estruturas de categoria simples ou relacionamentos Supabase
 * 
 * @param categories - O objeto de categorias do post (pode ser array ou objeto único)
 * @returns Um objeto com key (para tradução) e fallback (nome original)
 */
export function getCategoryTranslationKey(categories: any): { key: string; fallback: string } {
    if (!categories) return { key: '', fallback: '' };

    // Handle array or single object
    const cat = Array.isArray(categories) ? categories[0] : categories;
    if (!cat) return { key: '', fallback: '' };

    // Get slug or name
    const slugOrName = cat.slug || cat.name || '';
    const fallback = cat.name || cat.slug || '';

    return {
        key: normalizeCategorySlug(slugOrName),
        fallback
    };
}

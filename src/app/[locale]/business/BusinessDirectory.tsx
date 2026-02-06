'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Business } from '@/types/business';
import { BusinessCard } from '@/components/BusinessCard';
import { Search, MapPin, Filter, X, SearchX } from 'lucide-react';


// Hardcoded categories as per original
const CATEGORIES = [
    "Gastronomia", "Saúde & Bem-estar", "Serviços",
    "Imobiliárias", "Jurídico e Vistos", "Mudanças e Logística",
    "Tecnologia", "Outros"
];

interface BusinessDirectoryProps {
    businesses: Business[];
}

export function BusinessDirectory({ businesses }: BusinessDirectoryProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for inputs
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search and city to avoid too many URL updates
    // Actually, I'll update on submit or blur, or use debounce hook.
    // Let's use simple effect for now or explicit "Apply" if I don't have debounce hook ready, 
    // but users expect live-ish filtering. 
    // I'll create a simple debounced effect or use a utility.

    // I will implement a custom debounce effect here for simplicity

    const createQueryString = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        return params.toString();
    }, [searchParams]);

    const updateFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search); else params.delete('search');
        if (category) params.set('category', category); else params.delete('category');
        if (city) params.set('city', city); else params.delete('city');

        router.push(`${pathname}?${params.toString()}`);
    }, [search, category, city, pathname, router, searchParams]);

    // Effect for debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only push if params changed from URL
            const urlSearch = searchParams.get('search') || '';
            const urlCity = searchParams.get('city') || '';
            const urlCategory = searchParams.get('category') || '';

            if (search !== urlSearch || city !== urlCity || category !== urlCategory) {
                updateFilters();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, city, category, updateFilters, searchParams]);


    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8 relative">

            {/* Mobile Filter Toggle Button (Floating or Top) */}
            {/* This is handled in page header visually, but logically the sidebar needs `showFilters` */}
            {/* I need to bubble up or render the header button locally? 
                 The Page Header is usually static. 
                 I'll render the filter toggle here if it didn't fit in the header content.
                 Actually, looking at the layout, I'll put a button above if needed.
              */}

            {/* Backdrop */}
            {showFilters && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setShowFilters(false)}
                />
            )}

            {/* Sidebar Filters */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[280px] bg-app p-6 shadow-2xl transition-transform duration-300 md:translate-x-0 md:static md:w-64 md:bg-transparent md:border-none md:p-0 md:block md:shadow-none
                ${showFilters ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center md:hidden mb-8 pb-4 border-b border-app">
                    <h2 className="font-display font-bold text-xl text-primary">{t('business.filtersTitle', { defaultMessage: 'Filtros' })}</h2>
                    <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 rounded-lg bg-surface text-secondary hover:text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8 sticky top-24">
                    {/* Search (Sidebar version) */}
                    <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                            <span className="w-1 h-4 bg-nippon-red rounded-full"></span>
                            {t('common.search', { defaultMessage: 'Buscar' })}
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                placeholder={t('business.searchPlaceholder', { defaultMessage: 'Nome da empresa...' })}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-surface border border-app rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--nl-link)]/20 focus:border-[var(--nl-link)]/40 transition-all"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                            <span className="w-1 h-4 bg-nippon-red rounded-full"></span>
                            {t('business.categoriesLabel', { defaultMessage: 'Categorias' })}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <button
                                onClick={() => setCategory('')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${category === ''
                                    ? 'bg-[var(--nl-link)]/10 text-[var(--nl-link)] ring-1 ring-[var(--nl-link)]/20 shadow-sm font-semibold'
                                    : 'text-secondary hover:bg-surface hover:text-primary'}`}
                            >
                                {t('common.all', { defaultMessage: 'Todas' })}
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${category === cat
                                        ? 'bg-[var(--nl-link)]/10 text-[var(--nl-link)] ring-1 ring-[var(--nl-link)]/20 shadow-sm font-semibold'
                                        : 'text-secondary hover:bg-surface hover:text-primary'}`}
                                >
                                    {t(`business.categories.${cat}`, { defaultMessage: cat })}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                            <span className="w-1 h-4 bg-nippon-red rounded-full"></span>
                            {t('business.locationLabel', { defaultMessage: 'Localização' })}
                        </h3>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                placeholder={t('business.locationPlaceholder', { defaultMessage: 'Cidade ou Província' })}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-surface border border-app rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--nl-link)]/20 focus:border-[var(--nl-link)]/40 transition-all"
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(category || city || search) && (
                        <button
                            onClick={() => {
                                setCategory('');
                                setCity('');
                                setSearch('');
                            }}
                            className="w-full py-3 border border-app rounded-xl text-sm font-medium text-secondary hover:bg-surface hover:text-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            {t('business.clearFilters', { defaultMessage: 'Limpar Filtros' })}
                        </button>
                    )}
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Mobile Filter Toggle (Visible only on mobile) */}
                <div className="md:hidden mb-6">
                    <button
                        onClick={() => setShowFilters(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface rounded-xl border border-app text-primary shadow-sm"
                    >
                        <Filter className="w-4 h-4" />
                        {t('business.filtersTitle', { defaultMessage: 'Filtros' })}
                        {(category || city || search) && <span className="w-2 h-2 rounded-full bg-nippon-red ml-1" />}
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">{t('business.featuredTitle', { defaultMessage: 'Empresas em Destaque' })}</h2>
                    <span className="text-sm text-muted">{t('business.foundCount', { count: businesses.length, defaultMessage: `Mostrando ${businesses.length} resultados` })}</span>
                </div>

                {businesses.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-app">
                        <SearchX className="w-12 h-12 text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-primary">{t('business.noResults', { defaultMessage: 'Nenhuma empresa encontrada' })}</h3>
                        <p className="text-muted text-sm mt-2">{t('business.noResultsDesc', { defaultMessage: 'Tente ajustar seus filtros de busca.' })}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">
                        {businesses.map(business => (
                            <BusinessCard key={business.id} business={business} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

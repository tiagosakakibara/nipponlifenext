'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, Lightbulb, GraduationCap, Building2, MapPin, ChevronRight, Eye } from 'lucide-react';

export interface CategoryWithStats {
    id: string;
    name: string;
    slug: string;
    icon: string;
    total_views: number;
    post_count: number;
}

const ICON_MAP: Record<string, any> = {
    'home': Home,
    'lightbulb': Lightbulb,
    'graduation-cap': GraduationCap,
    'building': Building2,
    'map-pin': MapPin,
};

interface CategoriesSidebarProps {
    categories: CategoryWithStats[];
}

export function CategoriesSidebar({ categories }: CategoriesSidebarProps) {
    const t = useTranslations();

    return (
        <div className="flex flex-col gap-8">
            {/* Categories List */}
            <div>
                <h2 className="font-['Montserrat'] font-bold text-xs tracking-wider text-muted mb-4 px-4">{t('community.categoriesTitle', { defaultMessage: 'CATEGORIAS' })}</h2>
                <nav className="flex flex-col gap-1">
                    {categories.map((category) => {
                        const Icon = ICON_MAP[category.icon] || Home;
                        // For now we don't have active state tracking here as it's a list component on the main page
                        // In real app, we might check search params or path.
                        const isActive = false;

                        return (
                            <Link
                                key={category.id}
                                href={`/comunidade?category=${category.slug}`}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium font-['DM_Sans'] group
                                    ${isActive
                                        ? 'bg-[var(--nl-accent)] text-white shadow-md shadow-[#D70F24]/20'
                                        : 'text-secondary hover:bg-surface'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted group-hover:text-primary transition-colors'}`} />
                                    <span>{t(`community.categories.${category.name}`, { defaultMessage: category.name })}</span>
                                </div>

                                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">{category.total_views}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Promo Card */}
            <div className="bg-[#003768] rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
                <div className="relative z-10">
                    <h3 className="font-['Montserrat'] font-bold text-lg mb-2 leading-tight">
                        {t('community.newcomerGuide.title', { defaultMessage: 'Guia do Recém-Chegado' }).split(' ').map((word, i) => (
                            <span key={i}>{word}{(i === 0 || i === 2) ? <br /> : ' '}</span>
                        ))}
                    </h3>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                        {t('community.newcomerGuide.description', { defaultMessage: 'Tudo o que você precisa saber para começar sua vida no Japão com o pé direito.' })}
                    </p>
                    <Link
                        href="/guias/recem-chegado"
                        className="w-full bg-white text-[#003768] font-bold text-sm py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group"
                    >
                        {t('community.newcomerGuide.action', { defaultMessage: 'Ler Guia Completo' })}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

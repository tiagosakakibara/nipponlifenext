'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart, Home, FileText, Users, Briefcase, AlertTriangle, Shield, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface GuideCategoryGridProps {
    locale: string;
}

const iconMap: Record<string, any> = {
    health: Heart,
    saude: Heart,
    housing: Home,
    moradia: Home,
    documents: FileText,
    documentos: FileText,
    community: Users,
    convivencia: Users,
    work: Briefcase,
    trabalho: Briefcase,
    safety: AlertTriangle,
    cuidados: AlertTriangle,
    shield: Shield,
    default: BookOpen,
};

function getIconElement(iconKey: string | null, slug: string) {
    if (iconKey && iconMap[iconKey.toLowerCase()]) {
        const Icon = iconMap[iconKey.toLowerCase()];
        return <Icon className="w-6 h-6" />;
    }
    const slugLower = slug.toLowerCase();
    if (slugLower.includes('saude') || slugLower.includes('seguro')) {
        const Icon = iconMap.health;
        return <Icon className="w-6 h-6" />;
    }
    if (slugLower.includes('moradia') || slugLower.includes('casa')) {
        const Icon = iconMap.housing;
        return <Icon className="w-6 h-6" />;
    }
    if (slugLower.includes('documento')) {
        const Icon = iconMap.documents;
        return <Icon className="w-6 h-6" />;
    }
    if (slugLower.includes('conviv') || slugLower.includes('comunidade')) {
        const Icon = iconMap.community;
        return <Icon className="w-6 h-6" />;
    }
    if (slugLower.includes('trabalho') || slugLower.includes('emprego')) {
        const Icon = iconMap.work;
        return <Icon className="w-6 h-6" />;
    }
    if (slugLower.includes('cuidado') || slugLower.includes('seguranca')) {
        const Icon = iconMap.safety;
        return <Icon className="w-6 h-6" />;
    }
    const Icon = iconMap.default;
    return <Icon className="w-6 h-6" />;
}

export default function GuideCategoryGrid({ locale }: GuideCategoryGridProps) {
    const t = useTranslations();
    const [categories, setCategories] = useState<Array<{
        id: string;
        icon: React.ReactNode;
        title: string;
        description: string;
        href: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Safety: resolve skeleton after 8s even if query hangs
        const timeout = setTimeout(() => setLoading(false), 8000);

        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('guides_categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order');

                if (error) {
                    console.error('Error fetching categories:', error);
                } else if (data && data.length > 0) {
                    setCategories(data.map((cat: any) => {
                        let title = cat.name;
                        if (locale === 'en' && cat.name_en) title = cat.name_en;
                        if (locale === 'ja' && cat.name_ja) title = cat.name_ja;

                        let description = cat.description || `Guias sobre ${cat.name.toLowerCase()}.`;
                        if (locale === 'en' && cat.description_en) description = cat.description_en;
                        if (locale === 'ja' && cat.description_ja) description = cat.description_ja;

                        return {
                            id: cat.id,
                            icon: getIconElement(cat.icon, cat.slug),
                            title,
                            description,
                            href: `/guias/${cat.slug}`,
                        };
                    }));
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        };

        fetchCategories();
        return () => clearTimeout(timeout);
    }, [locale]);

    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="section-title text-primary text-2xl md:text-3xl font-bold mb-2">
                        {t('guides.categories.title')}
                    </h2>
                    <p className="text-secondary text-sm">
                        {t('guides.categories.subtitle')}
                    </p>
                </div>

                {/* Category Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-zinc-800 mb-4" />
                                <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-2/3 mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={category.href}
                                className="group bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-600 dark:bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-white dark:text-accent">
                                        {category.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-primary mb-2 group-hover:text-blue-600 dark:group-hover:text-accent transition-colors">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-secondary line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock, ChevronRight, Home } from 'lucide-react';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ locale: string; category: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, category } = await params;
    const supabase = await createClient();

    const { data: categoryData } = await supabase
        .from('guides_categories')
        .select('*')
        .eq('slug', category)
        .single();

    if (!categoryData) {
        return {
            title: 'Category Not Found | NipponLife',
        };
    }

    const name = locale === 'ja' ? categoryData.name_ja : locale === 'en' ? categoryData.name_en : categoryData.name;

    return {
        title: `${name} | NipponLife`,
        description: locale === 'ja' ? categoryData.description_ja : locale === 'en' ? categoryData.description_en : categoryData.description,
    };
}

export default async function CategoryPage({ params }: Props) {
    const { locale, category } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    // Fetch category
    const { data: categoryData, error: categoryError } = await supabase
        .from('guides_categories')
        .select('*')
        .eq('slug', category)
        .eq('is_active', true)
        .single();

    if (categoryError || !categoryData) {
        return notFound();
    }

    // Fetch guides in this category
    const { data: guides, error: guidesError } = await supabase
        .from('guides')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (guidesError) {
        console.error('Error fetching guides:', guidesError);
    }

    const categoryName = locale === 'ja' ? categoryData.name_ja : locale === 'en' ? categoryData.name_en : categoryData.name;
    const categoryDescription = locale === 'ja' ? categoryData.description_ja : locale === 'en' ? categoryData.description_en : categoryData.description;

    return (
        <main className="min-h-screen bg-app py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted mb-8 flex-wrap">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        <span>{t('nav.home')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/guias/recem-chegado" className="hover:text-primary transition-colors">
                        {t('guides.newcomerGuide')}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-primary font-medium">{categoryName}</span>
                </nav>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-primary mb-3">
                        {categoryName}
                    </h1>
                    <p className="text-lg text-muted">
                        {categoryDescription}
                    </p>
                </div>

                {/* Guides List */}
                {guides && guides.length > 0 ? (
                    <div className="space-y-4">
                        {guides.map((guide) => {
                            const title = locale === 'ja' ? guide.title_ja || guide.title : locale === 'en' ? guide.title_en || guide.title : guide.title;
                            const excerpt = locale === 'ja' ? guide.excerpt_ja || guide.excerpt : locale === 'en' ? guide.excerpt_en || guide.excerpt : guide.excerpt;

                            return (
                                <Link
                                    key={guide.id}
                                    href={`/guias/${category}/${guide.slug}`}
                                    className="group block bg-surface border border-app rounded-2xl p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        {guide.cover_image_url && (
                                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                <img
                                                    src={guide.cover_image_url}
                                                    alt={title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                                {title}
                                            </h2>
                                            {excerpt && (
                                                <p className="text-sm text-muted mb-3 line-clamp-2">
                                                    {excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted">
                                                {guide.reading_time_minutes && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{guide.reading_time_minutes} min</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-blue-500 group-hover:text-accent font-bold transition-colors">
                                                    {t('guides.readMore')}
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted text-lg mb-4">
                            {t('guides.noGuidesYet')}
                        </p>
                        <Link
                            href="/guias/recem-chegado"
                            className="inline-flex items-center gap-2 text-accent font-bold hover:underline"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            {t('guides.backToCategories')}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { Link } from '@/i18n/routing';
import { storageService } from '@/lib/storageService';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { Business } from '@/types/business';
import { ArticleTracking } from '@/components/ArticleTracking';
import { BusinessGallery } from '@/components/BusinessGallery';
import { ShareActions } from '@/components/ShareActions';
import { MapPin, Globe, Phone, Instagram, Clock, ArrowLeft, Eye, ExternalLink } from 'lucide-react';
import { generateSEOMetadata, generateBusinessSchema, generateBreadcrumbSchema } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';

// ISR: Revalidate every 10 minutes for business pages
export const revalidate = 600;

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const supabase = await createClient();
    const { data: business } = await supabase.from('businesses').select('*').eq('slug', slug).single();

    if (!business) return {};

    const name = getTranslatedField(business, 'business_name', locale);
    const desc = getTranslatedField(business, 'description_short', locale);

    return generateSEOMetadata({
        title: name,
        description: desc,
        locale,
        type: 'profile',
        url: `/business/${slug}`,
        images: business.cover_image_url ? [business.cover_image_url] :
            business.logo_url ? [business.logo_url] : [],
    });
}

export default async function BusinessProfilePage({ params }: Props) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale });
    const supabase = await createClient();

    const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (!business) {
        notFound();
    }

    const b = business as Business;
    const name = getTranslatedField(b, 'business_name', locale);
    const description = getTranslatedField(b, 'description_long', locale) || getTranslatedField(b, 'description_short', locale);
    const address = getTranslatedField(b, 'address_line1', locale);
    const city = getTranslatedField(b, 'city', locale);
    const prefecture = getTranslatedField(b, 'prefecture', locale);
    const category = t(`business.categories.${b.category}`, { defaultMessage: b.category });

    const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/business/${slug}`;

    // Generate JSON-LD schemas
    const businessSchema = generateBusinessSchema({
        name,
        description: description || '',
        url: pageUrl,
        image: b.cover_image_url || b.logo_url || '',
        address: address || '',
        city: city || '',
        prefecture: prefecture || '',
        phone: b.whatsapp || undefined,
        website: b.website_url || pageUrl,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: t('breadcrumb.home', { defaultValue: 'Home' }), url: `/${locale}` },
        { name: t('business.title', { defaultValue: 'Negócios' }), url: `/${locale}/business` },
        { name, url: `/${locale}/business/${slug}` },
    ]);

    return (
        <div className="min-h-screen bg-app pb-20">
            <StructuredData data={businessSchema} />
            <StructuredData data={breadcrumbSchema} />

            <ArticleTracking slug={slug} type="business" />

            {/* Hero / Cover */}
            <div className="relative h-64 md:h-80 bg-gray-900 overflow-hidden">
                {b.cover_image_url && (
                    <img
                        src={storageService.getFileUrl(b.cover_image_url)}
                        alt={name}
                        className="w-full h-full object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--nl-bg)] to-transparent" />

                <div className="absolute top-4 left-4 z-10 w-full px-4 max-w-7xl mx-auto">
                    <Link href="/business" className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-sm text-white hover:bg-black/60 transition-colors border border-white/10">
                        <ArrowLeft className="w-4 h-4" /> {t('business.back', { defaultMessage: 'Voltar' })}
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-surface border-[6px] border-surface overflow-hidden shadow-2xl flex-shrink-0 relative group">
                                {b.logo_url ? (
                                    <img src={storageService.getFileUrl(b.logo_url)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-4xl font-display text-white">
                                        {name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 pb-2 text-center md:text-left space-y-2">
                                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                                    {b.featured && (
                                        <span className="bg-gradient-to-r from-nippon-red to-sakura text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-nippon-red/20">
                                            {t('business.premiumPartner', { defaultMessage: 'Parceiro Premium' })}
                                        </span>
                                    )}
                                    <span className="bg-surface text-xs font-medium px-3 py-1 rounded-full text-primary border border-app shadow-sm">
                                        {category}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-display font-black text-primary leading-tight">
                                    {name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-secondary text-sm md:text-base justify-center md:justify-start font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-nippon-red" />
                                        <span>{city}, {prefecture}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-nippon-red" />
                                        <span>{b.view_count || 0} {t('common.views', { defaultMessage: 'visualizações' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Share Actions */}
                        <div className="md:hidden">
                            <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider text-center">{t('common.share', { defaultMessage: 'Compartilhar' })}</h3>
                            <ShareActions
                                url={pageUrl}
                                title={name}
                                text={t('business.shareText', { name, defaultMessage: `Confira ${name} no NipponLife` })}
                                variant="inline"
                                className="justify-center"
                            />
                        </div>

                        {/* About */}
                        <div className="bg-surface border border-app rounded-3xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 font-display text-primary">{t('business.about', { defaultMessage: 'Sobre' })}</h2>
                            <div className="text-lg text-secondary leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                                {description}
                            </div>
                        </div>

                        {/* Presentation */}
                        {b.presentation_url && (
                            <div className="bg-surface border border-app rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-2xl font-bold font-display flex items-center gap-2 text-primary">
                                        <span className="text-2xl">📄</span> {t('business.presentation', { defaultMessage: 'Apresentação' })}
                                    </h2>
                                    <a
                                        href={b.presentation_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-white bg-gradient-to-r from-nippon-red to-rose-600 hover:to-rose-500 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-nippon-red/20 transition-all hover:-translate-y-0.5"
                                    >
                                        {t('business.openNewTab', { defaultMessage: 'Abrir' })} <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                                <div className="w-full aspect-[16/9] bg-[#2a2a40] rounded-2xl overflow-hidden border border-white/10 relative group">
                                    <iframe
                                        src={`${b.presentation_url}#toolbar=0`}
                                        className="w-full h-full"
                                        title={t('business.presentation', { defaultMessage: 'Apresentação' })}
                                    />
                                    {/* Overlay for mobile hint */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none md:hidden">
                                        <p className="text-white font-medium">{t('business.fullscreenHint', { defaultMessage: 'Toque para abrir' })}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gallery */}
                        <BusinessGallery images={b.gallery_images || []} title={name} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 pt-6 lg:pt-32">
                        {/* Desktop Share */}
                        <div className="hidden md:block bg-surface border border-app rounded-3xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-primary">{t('common.share', { defaultMessage: 'Compartilhar' })}</h3>
                            <ShareActions
                                url={pageUrl}
                                title={name}
                                text={t('business.shareText', { name, defaultMessage: `Confira ${name} no NipponLife` })}
                                variant="inline"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="bg-surface border border-app rounded-3xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-6 text-primary">{t('business.contactReservations', { defaultMessage: 'Contato e Reservas' })}</h3>

                            {b.whatsapp && (
                                <a
                                    href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-center py-3.5 rounded-2xl mb-6 transition-all shadow-lg hover:shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-5 h-5" /> WhatsApp
                                </a>
                            )}

                            <div className="space-y-4 text-sm font-medium">
                                {b.phone && (
                                    <a href={`tel:${b.phone.replace(/\D/g, '')}`} className="flex items-center gap-4 text-secondary hover:text-primary transition-colors group p-2 hover:bg-app rounded-xl -mx-2">
                                        <div className="w-10 h-10 rounded-full bg-app group-hover:bg-surface flex items-center justify-center border border-app transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span>{b.phone}</span>
                                    </a>
                                )}
                                {b.website_url && (
                                    <a href={b.website_url} target="_blank" className="flex items-center gap-4 text-secondary hover:text-link transition-colors group p-2 hover:bg-app rounded-xl -mx-2">
                                        <div className="w-10 h-10 rounded-full bg-app group-hover:bg-surface flex items-center justify-center border border-app transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <span className="truncate">{b.website_url.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )}
                                {b.instagram_url && (
                                    <a href={b.instagram_url} target="_blank" className="flex items-center gap-4 text-secondary hover:text-pink-400 transition-colors group p-2 hover:bg-app rounded-xl -mx-2">
                                        <div className="w-10 h-10 rounded-full bg-app group-hover:bg-surface flex items-center justify-center border border-app transition-colors">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <span>@{b.instagram_url.split('/').filter(Boolean).pop()?.replace('@', '')}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-surface border border-app rounded-3xl overflow-hidden p-1.5 shadow-sm">
                            <div className="aspect-video bg-gray-800 relative group overflow-hidden rounded-2xl">
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <MapPin className="w-16 h-16 text-nippon-red opacity-20" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <a
                                        href={b.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${address}, ${city}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <MapPin className="w-4 h-4 text-nippon-red" />
                                        {t('business.openGoogleMaps', { defaultMessage: 'Abrir no Maps' })}
                                    </a>
                                </div>
                                {/* Always visible on mobile if needed, but hover works well for desktop. Link wraps usually. */}
                                <a
                                    href={b.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${address}, ${city}`)}`}
                                    className="absolute inset-0 md:hidden"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="sr-only">Open Maps</span>
                                </a>
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-sm font-medium text-primary leading-snug">{address}</p>
                                <p className="text-xs text-muted mt-1 uppercase tracking-wider font-bold">{city}, {prefecture}</p>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-surface border border-app rounded-3xl p-6 shadow-sm">
                            <h3 className="font-bold text-sm mb-5 flex items-center gap-2 text-primary uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-sakura" />
                                {t('business.businessHours', { defaultMessage: 'Horário de Funcionamento' })}
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-secondary border-b border-app/50 pb-2 border-dashed last:border-0 last:pb-0">
                                    <span className="font-medium">{t('business.weekdays', { defaultMessage: 'Segunda a Sexta' })}</span>
                                    <span>09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between text-secondary border-b border-app/50 pb-2 border-dashed last:border-0 last:pb-0">
                                    <span className="font-medium">{t('business.saturday', { defaultMessage: 'Sábado' })}</span>
                                    <span>10:00 - 15:00</span>
                                </div>
                                <div className="flex justify-between text-muted border-b border-app/50 pb-2 border-dashed last:border-0 last:pb-0">
                                    <span className="font-medium">{t('business.sunday', { defaultMessage: 'Domingo' })}</span>
                                    <span className="text-red-400 bg-red-400/10 px-2 rounded text-xs py-0.5 font-bold">{t('business.closed', { defaultMessage: 'Fechado' })}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

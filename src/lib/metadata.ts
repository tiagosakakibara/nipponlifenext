import { Metadata } from 'next';
import { storageService } from './storageService';

export interface MetadataConfig {
  title: string;
  description: string;
  locale: string;
  type?: 'website' | 'article' | 'profile';
  images?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  url?: string;
}

const SITE_NAME = 'NipponLife';
const DEFAULT_OG_IMAGE = '/images/logo-full.png';

// Get site URL from environment or fallback to localhost
const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

/**
 * Generates standardized metadata for SEO and Open Graph
 * @param config Metadata configuration
 * @returns Metadata object for Next.js
 */
export function generateSEOMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    locale,
    type = 'website',
    images = [],
    publishedTime,
    modifiedTime,
    authors,
    tags,
    url,
  } = config;

  const SITE_URL = getSiteUrl();

  // Resolve image URLs (Supabase Storage or local)
  const ogImages = images.length > 0
    ? images.map(img => {
        // If already a full URL, use as is
        if (img.startsWith('http')) return img;
        // If relative path, check if it needs storage service
        if (img.startsWith('/')) return `${SITE_URL}${img}`;
        // Otherwise use storage service
        return storageService.getFileUrl(img);
      })
    : [`${SITE_URL}${DEFAULT_OG_IMAGE}`];

  // Locale mapping (Next.js standard)
  const localeMap: Record<string, string> = {
    pt: 'pt_BR',
    en: 'en_US',
    ja: 'ja_JP',
  };

  const ogLocale = localeMap[locale] || 'pt_BR';
  const alternateLocales = Object.values(localeMap).filter(l => l !== ogLocale);

  // Canonical URL
  const canonicalUrl = url ? `${SITE_URL}/${locale}${url}` : undefined;

  const metadata: Metadata = {
    title: `${title} | ${SITE_NAME}`,
    description: description.substring(0, 160),

    // Canonical
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),

    // Open Graph
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale: alternateLocales,
      type,
      images: ogImages.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: title,
      })),
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
        tags,
      }),
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: ogImages,
      site: '@NipponLifejp', // TODO: Verify Twitter handle
      creator: '@NipponLifejp',
    },

    // Keywords (optional, Google doesn't use but doesn't hurt)
    ...(tags && tags.length > 0 && {
      keywords: tags.join(', '),
    }),
  };

  return metadata;
}

/**
 * Generates JSON-LD Schema for Article
 */
export function generateArticleSchema(config: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
}) {
  const SITE_URL = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: config.description,
    url: config.url,
    image: config.image.startsWith('http') ? config.image : storageService.getFileUrl(config.image),
    datePublished: config.publishedTime,
    dateModified: config.modifiedTime || config.publishedTime,
    author: {
      '@type': 'Person',
      name: config.authorName || 'NipponLife',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NipponLife',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo-full.png`,
      },
    },
  };
}

/**
 * Generates JSON-LD Schema for LocalBusiness
 */
export function generateBusinessSchema(config: {
  name: string;
  description: string;
  url: string;
  image: string;
  address: string;
  city: string;
  prefecture: string;
  phone?: string;
  website?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    description: config.description,
    url: config.url,
    image: config.image.startsWith('http') ? config.image : storageService.getFileUrl(config.image),
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
      addressLocality: config.city,
      addressRegion: config.prefecture,
      addressCountry: 'JP',
    },
    ...(config.phone && { telephone: config.phone }),
    ...(config.website && { url: config.website }),
  };
}

/**
 * Generates JSON-LD Schema for Event
 */
export function generateEventSchema(config: {
  name: string;
  description: string;
  url: string;
  image: string;
  startDate: string;
  endDate?: string;
  location: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: config.name,
    description: config.description,
    url: config.url,
    image: config.image.startsWith('http') ? config.image : storageService.getFileUrl(config.image),
    startDate: config.startDate,
    ...(config.endDate && { endDate: config.endDate }),
    location: {
      '@type': 'Place',
      name: config.location,
    },
  };
}

/**
 * Generates JSON-LD Breadcrumb
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const SITE_URL = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

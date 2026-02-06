import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const locales = ['pt', 'en', 'ja'];

  const routes: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    '',
    '/noticias',
    '/business',
    '/eventos',
    '/comunidade',
    '/comunidade/duvidas',
    '/galeria',
    '/statistics',
    '/guias/recem-chegado',
    '/vagas',
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic: News
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (posts) {
    for (const locale of locales) {
      for (const post of posts) {
        routes.push({
          url: `${baseUrl}/${locale}/noticias/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Dynamic: Businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (businesses) {
    for (const locale of locales) {
      for (const business of businesses) {
        routes.push({
          url: `${baseUrl}/${locale}/business/${business.slug}`,
          lastModified: new Date(business.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  // Dynamic: Events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (events) {
    for (const locale of locales) {
      for (const event of events) {
        routes.push({
          url: `${baseUrl}/${locale}/eventos/${event.slug}`,
          lastModified: new Date(event.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  // Dynamic: Community Posts
  const { data: communityPosts } = await supabase
    .from('community_posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (communityPosts) {
    for (const locale of locales) {
      for (const post of communityPosts) {
        routes.push({
          url: `${baseUrl}/${locale}/comunidade/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
  }

  // Dynamic: Guides
  const { data: guides } = await supabase
    .from('guides')
    .select('slug, guide_category:guides_categories(slug), updated_at')
    .eq('status', 'published');

  if (guides) {
    for (const locale of locales) {
      for (const guide of guides) {
        const categorySlug = (guide.guide_category as any)?.slug || 'geral';
        routes.push({
          url: `${baseUrl}/${locale}/guias/${categorySlug}/${guide.slug}`,
          lastModified: new Date(guide.updated_at),
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    }
  }

  // Dynamic: Community Questions
  const { data: questions } = await supabase
    .from('community_questions')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (questions) {
    for (const locale of locales) {
      for (const question of questions) {
        routes.push({
          url: `${baseUrl}/${locale}/comunidade/duvidas/${question.slug}`,
          lastModified: new Date(question.updated_at),
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
  }

  return routes;
}

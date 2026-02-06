'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function ArticleTracking({ slug, id, type = 'news' }: { slug?: string, id?: string, type?: 'news' | 'business' | 'community' }) {
    useEffect(() => {
        if (!slug && !id) return;

        // Simple fire and forget
        if (type === 'news' && slug) {
            supabase.rpc('increment_post_view', { p_slug: slug }).then(({ error }) => {
                if (error) console.error('Error tracking view:', error);
            });
        } else if (type === 'business' && slug) {
            supabase.rpc('increment_business_view', { business_slug: slug }).then(({ error }) => {
                if (error) console.error('Error tracking business view:', error);
            });
        } else if (type === 'community' && id) {
            supabase.rpc('increment_post_view', { post_id: id }).then(({ error }) => {
                if (error) console.error('Error tracking community view:', error);
            });
        }
    }, [slug, id, type]);

    return null;
}

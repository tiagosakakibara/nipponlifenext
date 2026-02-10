"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface DashboardKPIs {
    totalPosts: number;
    recentPosts: number; // Last 7 days
    totalJobs: number;
    recentJobs: number; // Last 7 days
    upcomingEvents: number; // Start date >= today
    newUsers: number; // Last 7 days
    recentCommunityPosts: number; // Last 7 days
    totalBusinesses: number;
    views: {
        news: number;
        community: number;
        questions: number;
        jobs: number;
        events: number;
        business: number;
        guides: number;
        gallery: number;
    };
}

export interface DailyActivity {
    date: string;
    posts: number;
    jobs: number;
    community: number;
}

export interface DashboardListItems {
    recentPosts: { id: string; title: string; status: string; date: string }[];
    upcomingEvents: { id: string; title: string; date: string; location: string }[];
    expiringJobs: { id: string; title: string; company: string; date: string }[];
    recentCommunityQuestions: { id: string; title: string; author: string; date: string; slug: string }[];
    recentCommunityActivities: { id: string; content: string; author: string; date: string; type: 'comment' | 'answer'; targetId: string; targetSlug: string }[];
}

interface UseAdminDashboardResult {
    kpis: DashboardKPIs | null;
    charts: DailyActivity[];
    lists: DashboardListItems | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardResult {
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [charts, setCharts] = useState<DailyActivity[]>([]);
    const [lists, setLists] = useState<DashboardListItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getDashboardKPIs = async (supabase: ReturnType<typeof createClient>): Promise<DashboardKPIs> => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const today = new Date().toISOString().split('T')[0];

        // Use Promise.allSettled to handle errors gracefully - if one query fails, others still work
        const results = await Promise.allSettled([
            // 1. Posts Stats (Published)
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', sevenDaysAgo),

            // 2. Jobs Stats
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published').gte('created_at', sevenDaysAgo),

            // 3. Events (Upcoming)
            supabase.from('calendar_events').select('*', { count: 'exact', head: true }).gte('starts_at', today),

            // 4. Users (New)
            supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),

            // 5. Community Posts (Recent) - Fixed: using community_posts instead of community_questions
            supabase.from('community_posts').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),

            // 6. Businesses (Total)
            supabase.from('businesses').select('*', { count: 'exact', head: true }),

            // 7. View Counts (Sum of all view_count in each table)
            // TODO: Optimize with Supabase RPC function to avoid fetching all rows
            // For now, fetching all view_count fields and summing client-side
            supabase.from('posts').select('view_count'),
            supabase.from('community_posts').select('view_count'),
            supabase.from('community_questions').select('view_count'),
            supabase.from('jobs').select('view_count'),
            supabase.from('calendar_events').select('view_count'),
            supabase.from('businesses').select('view_count'),
            supabase.from('guides').select('view_count'),
            supabase.from('gallery_albums').select('view_count'),
        ]);

        // Helper to safely extract count from result
        const getCount = (index: number): number => {
            const result = results[index];
            if (result.status === 'fulfilled') {
                return result.value.count || 0;
            }
            // Silent fail for dashboard robustness
            return 0;
        };

        // Helper to safely extract data from result
        const getData = (index: number): any[] | null => {
            const result = results[index];
            if (result.status === 'fulfilled') {
                return result.value.data;
            }
            return null;
        };

        const sumViews = (data: any[] | null) => {
            if (!data || !Array.isArray(data)) return 0;
            return data.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
        };

        return {
            totalPosts: getCount(0),
            recentPosts: getCount(1),
            totalJobs: getCount(2),
            recentJobs: getCount(3),
            upcomingEvents: getCount(4),
            newUsers: getCount(5),
            recentCommunityPosts: getCount(6),
            totalBusinesses: getCount(7),
            views: {
                news: sumViews(getData(8)),
                community: sumViews(getData(9)),
                questions: sumViews(getData(10)),
                jobs: sumViews(getData(11)),
                events: sumViews(getData(12)),
                business: sumViews(getData(13)),
                guides: sumViews(getData(14)),
                gallery: sumViews(getData(15))
            }
        };
    };

    const getDashboardCharts = async (supabase: ReturnType<typeof createClient>): Promise<DailyActivity[]> => {
        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch reduced data with error handling
        const results = await Promise.allSettled([
            supabase.from('posts').select('created_at').gte('created_at', fourteenDaysAgo),
            supabase.from('jobs').select('created_at').gte('created_at', fourteenDaysAgo),
            // Fixed: using community_posts instead of community_questions
            supabase.from('community_posts').select('created_at').gte('created_at', fourteenDaysAgo),
        ]);

        const posts = results[0].status === 'fulfilled' ? results[0].value.data : null;
        const jobs = results[1].status === 'fulfilled' ? results[1].value.data : null;
        const community = results[2].status === 'fulfilled' ? results[2].value.data : null;

        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Chart query ${index} failed:`, result.reason);
            }
        });

        // Aggregate by date (YYYY-MM-DD)
        const activityMap: Record<string, DailyActivity> = {};

        // Initialize last 14 days with 0
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            activityMap[dateStr] = { date: dateStr, posts: 0, jobs: 0, community: 0 };
        }

        // Fill counts
        posts?.forEach(p => {
            const date = p.created_at.split('T')[0];
            if (activityMap[date]) activityMap[date].posts++;
        });
        jobs?.forEach(j => {
            const date = j.created_at.split('T')[0];
            if (activityMap[date]) activityMap[date].jobs++;
        });
        community?.forEach(c => {
            const date = c.created_at.split('T')[0];
            if (activityMap[date]) activityMap[date].community++;
        });

        // Return as sorted array
        return Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));
    };

    const getDashboardLists = async (supabase: ReturnType<typeof createClient>): Promise<DashboardListItems> => {
        const today = new Date().toISOString();

        // Fetch all lists with error handling
        const results = await Promise.allSettled([
            // Latest Posts
            supabase.from('posts')
                .select('id, title, status, published_at, created_at')
                .order('created_at', { ascending: false })
                .limit(5),

            // Upcoming Events
            supabase.from('calendar_events')
                .select('id, title, starts_at, location')
                .gte('starts_at', today)
                .order('starts_at', { ascending: true })
                .limit(5),

            // Recent/Expiring Jobs
            supabase.from('jobs')
                .select('id, title, company_name, created_at')
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent Community Questions
            supabase.from('community_questions')
                .select(`
                    id,
                    title,
                    created_at,
                    slug,
                    profiles (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent Community Answers
            supabase.from('community_answers')
                .select(`
                    id,
                    body,
                    created_at,
                    question_id,
                    community_questions!inner(slug),
                    profiles (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent Community Post Comments
            supabase.from('community_post_comments')
                .select(`
                    id,
                    content,
                    created_at,
                    post_id,
                    community_posts!inner(slug),
                    profiles (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5),
        ]);

        const recentPosts = results[0].status === 'fulfilled' ? results[0].value.data : null;
        const upcomingEvents = results[1].status === 'fulfilled' ? results[1].value.data : null;
        const expiringJobs = results[2].status === 'fulfilled' ? results[2].value.data : null;
        const recentQuestions = results[3].status === 'fulfilled' ? results[3].value.data : null;
        const recentAnswers = results[4].status === 'fulfilled' ? results[4].value.data : null;
        const recentPostComments = results[5].status === 'fulfilled' ? results[5].value.data : null;

        // Log any failures only in development
        if (process.env.NODE_ENV === 'development') {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.warn(`List query ${index} failed:`, result.reason);
                }
            });
        }

        const activities: any[] = [
            ...(recentAnswers || []).map(a => ({
                id: a.id,
                content: (a as any).body,
                author: (a as any).profiles?.full_name || 'Usuário',
                date: (a as any).created_at,
                type: 'answer' as const,
                targetId: (a as any).question_id,
                targetSlug: (a as any).community_questions?.slug
            })),
            ...(recentPostComments || []).map(c => ({
                id: c.id,
                content: (c as any).content,
                author: (c as any).profiles?.full_name || 'Usuário',
                date: (c as any).created_at,
                type: 'comment' as const,
                targetId: (c as any).post_id,
                targetSlug: (c as any).community_posts?.slug
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


        return {
            recentPosts: recentPosts?.map(p => ({
                id: p.id,
                title: p.title,
                status: p.status,
                date: p.published_at || p.created_at
            })) || [],
            upcomingEvents: upcomingEvents?.map(e => ({
                id: e.id,
                title: e.title,
                date: e.starts_at,
                location: e.location
            })) || [],
            expiringJobs: expiringJobs?.map(j => ({
                id: j.id,
                title: j.title,
                company: j.company_name,
                date: j.created_at
            })) || [],
            recentCommunityQuestions: (recentQuestions as any)?.map((q: any) => ({
                id: q.id,
                title: q.title,
                author: q.profiles?.full_name || 'Usuário',
                slug: q.slug,
                date: q.created_at
            })) || [],
            recentCommunityActivities: activities
        };
    };

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        setLoading(true);
        setError(null);
        try {
            const [kpisData, chartsData, listsData] = await Promise.all([
                getDashboardKPIs(supabase),
                getDashboardCharts(supabase),
                getDashboardLists(supabase)
            ]);

            setKpis(kpisData);
            setCharts(chartsData);
            setLists(listsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Falha ao carregar dados do dashboard.');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        kpis,
        charts,
        lists,
        loading,
        error,
        refresh: fetchData
    };
}

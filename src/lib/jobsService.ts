import { supabase } from './supabaseClient';
import { Job, JobComment } from '../types/job';

const DB_TABLE = 'jobs';

export const jobsService = {
    // --- Public methods ---

    async getPublishedJobs(): Promise<Job[]> {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('status', 'published')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }

        return data.map(this.mapDbToJob);
    },

    async getJobBySlug(slug: string): Promise<Job | null> {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            return null;
        }

        return this.mapDbToJob(data);
    },

    // --- Admin methods ---

    async getAdminJobs(page = 1, limit = 20, search?: string) {
        let query = supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;
        return { data: (data || []).map(this.mapDbToJob), count };
    },

    async getJobById(id: string): Promise<Job> {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return this.mapDbToJob(data);
    },

    async createJob(data: any) {
        const { data: newJob, error } = await supabase
            .from(DB_TABLE)
            .insert([this.mapJobToDb(data)])
            .select()
            .single();

        if (error) throw error;
        return this.mapDbToJob(newJob);
    },

    async updateJob(id: string, data: any) {
        const { data: updated, error } = await supabase
            .from(DB_TABLE)
            .update(this.mapJobToDb(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbToJob(updated);
    },

    async deleteJob(id: string) {
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- Comments ---

    async getComments(jobId: string): Promise<JobComment[]> {
        const { data, error } = await supabase
            .from('job_comments')
            .select('*, author:profiles(username, full_name, avatar_url)')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }

        return data.map((c: any) => ({
            id: c.id,
            job_id: c.job_id,
            author_id: c.author_id,
            content: c.content,
            created_at: c.created_at,
            author: c.author
        }));
    },

    async addComment(jobId: string, content: string, userId: string): Promise<JobComment | null> {
        const { data, error } = await supabase
            .from('job_comments')
            .insert({
                job_id: jobId,
                author_id: userId,
                content: content
            })
            .select('*, author:profiles(username, full_name, avatar_url)')
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            throw error;
        }

        return {
            id: data.id,
            job_id: data.job_id,
            author_id: data.author_id,
            content: data.content,
            created_at: data.created_at,
            author: data.author
        };
    },

    // --- Helpers ---

    mapDbToJob(j: any): Job {
        return mapDbToJob(j);
    },

    mapJobToDb(job: any) {
        return mapJobToDb(job);
    }
};

// --- Standalone Helpers ---

export function mapDbToJob(j: any): Job {
    return {
        id: j.id,
        title: j.title,
        company: j.company_name,
        location: j.prefecture ? `${j.prefecture}, ${j.city || ''}` : j.location,
        description: j.description ? j.description.split('\n') : [],
        requirements: j.requirements || [],
        benefits: Array.isArray(j.benefits) ? j.benefits : [],
        salary: j.salary_text || (j.pay_rate_yen ? `¥${j.pay_rate_yen.toLocaleString()}/${j.pay_unit}` : j.pay_text),
        bonus: j.bonus_text,
        tags: j.tags || [],
        type: (j.job_type?.toLowerCase() as any) || 'full-time',
        featured: j.featured,
        logo: j.cover_image_url,
        slug: j.slug,
        status: j.status,
        expires_at: j.expires_at,
        position_order: j.position_order,
        // Original Db fields for form
        db_fields: j,

        // Translation fields mapping
        title_ja: j.title_ja,
        title_en: j.title_en,
        description_ja: j.description_ja ? (Array.isArray(j.description_ja) ? j.description_ja : j.description_ja.split('\n')) : undefined,
        description_en: j.description_en ? (Array.isArray(j.description_en) ? j.description_en : j.description_en.split('\n')) : undefined,
        requirements_ja: j.requirements_ja,
        requirements_en: j.requirements_en,
        benefits_ja: j.benefits_ja,
        benefits_en: j.benefits_en,
        salary_ja: j.salary_text_ja,
        salary_en: j.salary_text_en,
        bonus_ja: j.bonus_text_ja,
        bonus_en: j.bonus_text_en,
        location_ja: j.location_ja,
        location_en: j.location_en
    };
}

export function mapJobToDb(job: any) {
    // This is a simplified mapping, might need more detail for exact db schema
    const db: any = { ...job };
    // Handle field name differences if necessary
    return db;
}

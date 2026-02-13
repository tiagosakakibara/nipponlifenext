import { supabase } from './supabaseClient';
import { Job } from '../types/job';

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
        // Original Db fields for form
        db_fields: j
    };
}

export function mapJobToDb(job: any) {
    // This is a simplified mapping, might need more detail for exact db schema
    const db: any = { ...job };
    // Handle field name differences if necessary
    return db;
}

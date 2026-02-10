import { supabase } from './supabaseClient';
import { storageService, StorageFolder } from './storageService';
import { Business, BusinessFormData } from '../types/business';

const DB_TABLE = 'businesses';

// Helper to normalize slug
function generateBaseSlug(name: string, city: string): string {
    const combined = `${name}-${city}`;
    return combined
        .toLowerCase()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, ''); // Trim start/end hyphens
}

export const businessService = {
    // --- Public ---

    async getBusinesses({
        status = 'published',
        category,
        city,
        featured,
        search,
        page = 1,
        pageSize = 8
    }: {
        status?: 'draft' | 'published';
        category?: string;
        city?: string;
        featured?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
    } = {}) {
        let query = supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact' });

        // Apply status filter if provided
        if (status) {
            query = query.eq('status', status);
        }

        if (category) {
            query = query.eq('category', category);
        }
        if (city) {
            query = query.ilike('city', city); // Case insensitive
        }
        if (featured) {
            query = query.eq('featured', true);
        }
        if (search) {
            // Simple text search on name or description or city
            query = query.or(`business_name.ilike.%${search}%,city.ilike.%${search}%`);
        }

        // Ordering: Featured first, then Newest
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;
        return { data: data as Business[], count };
    },

    async getPublishedBusinesses(page = 1, pageSize = 8) {
        return this.getBusinesses({ status: 'published', page, pageSize });
    },

    async getBusinessCount() {
        const { count, error } = await supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');

        if (error) throw error;
        return count || 0;
    },

    async getBusinessBySlug(slug: string) {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data as Business;
    },

    // --- Admin ---

    async getAdminBusinesses(page = 1, limit = 20, search?: string) {
        let query = supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`business_name.ilike.%${search}%,city.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;
        return { data: data as Business[], count };
    },

    async getBusinessById(id: string) {
        const { data, error } = await supabase
            .from(DB_TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Business;
    },

    async createBusiness(data: BusinessFormData) {
        // Auto-generate unique slug
        let slug = generateBaseSlug(data.business_name, data.city);
        let uniqueSlug = slug;
        let counter = 1;

        // Loop to find a unique slug (basic check)
        // Note: Race conditions possible but unlikely in low volume. 
        // ideally handled by DB constraint error but loop is user friendly.
        while (true) {
            const { data: existing } = await supabase
                .from(DB_TABLE)
                .select('id')
                .eq('slug', uniqueSlug)
                .single();

            if (!existing) break; // Unique found

            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        const { data: newBusiness, error } = await supabase
            .from(DB_TABLE)
            .insert([{ ...data, slug: uniqueSlug }])
            .select()
            .single();

        if (error) throw error;
        return newBusiness as Business;
    },

    async updateBusiness(id: string, data: Partial<BusinessFormData>) {
        // Handle old image deletion if they are being replaced
        const { data: existing } = await supabase
            .from(DB_TABLE)
            .select('logo_url, cover_image_url')
            .eq('id', id)
            .single();

        if (existing) {
            // Deletar imagens antigas em paralelo se estiverem sendo substituídas
            const deletions: Promise<unknown>[] = [];
            if (data.logo_url && existing.logo_url && data.logo_url !== existing.logo_url) {
                deletions.push(storageService.deleteFile(existing.logo_url));
            }
            if (data.cover_image_url && existing.cover_image_url && data.cover_image_url !== existing.cover_image_url) {
                deletions.push(storageService.deleteFile(existing.cover_image_url));
            }
            if (deletions.length > 0) await Promise.all(deletions);
        }

        const { slug, ...updateData } = data;

        const { data: updated, error } = await supabase
            .from(DB_TABLE)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated as Business;
    },

    async deleteBusiness(id: string) {
        // 1. Get images to delete from storage
        const { data: business } = await supabase
            .from(DB_TABLE)
            .select('logo_url, cover_image_url')
            .eq('id', id)
            .single();

        if (business) {
            if (business.logo_url) await storageService.deleteFile(business.logo_url);
            if (business.cover_image_url) await storageService.deleteFile(business.cover_image_url);
        }

        // 2. Delete record
        const { error } = await supabase
            .from(DB_TABLE)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- Storage ---

    async uploadFile(file: File, folder: StorageFolder): Promise<string> {
        return storageService.uploadFile(file, folder);
    }
}

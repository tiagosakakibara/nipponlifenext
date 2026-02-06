import { supabase } from '@/lib/supabaseClient';

export interface CostOfLivingEntry {
    id: string;
    user_id: string;
    month_key: string;
    prefecture_code: string;
    job_category: string;
    employment_type: string;
    household_size: number;
    hourly_wage: number;
    monthly_net_income: number | null;
    rent: number;
    utilities: number;
    internet_phone: number;
    food: number;
    transport: number;
    health_insurance: number;
    pension: number;
    other_essentials: number;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export const communityCostOfLivingService = {
    async fetchCommunityStats() {
        const { data, error } = await supabase
            .from('v_community_cost_of_living_by_prefecture')
            .select('*')
            .order('contributions', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data as {
            prefecture_code: string;
            contributions: number;
            avg_hourly_wage: number;
            avg_monthly_essential_cost: number;
            avg_rent: number;
            avg_food: number;
            avg_transport: number;
        }[];
    },

    async fetchCommunityCategoryStats() {
        const { data, error } = await supabase
            .from('v_community_cost_of_living_by_job_category')
            .select('*')
            .order('contributions', { ascending: false });

        if (error) throw error;
        return data as {
            job_category: string;
            contributions: number;
            avg_hourly_wage: number;
            avg_monthly_net_income: number;
            avg_rent: number;
            avg_food: number;
            avg_transport: number;
            avg_monthly_essential_cost: number;
        }[];
    },

    async fetchRecentNotes(limit = 6) {
        const { data, error } = await supabase
            .from('community_cost_of_living_entries')
            .select('prefecture_code, job_category, notes, created_at')
            .not('notes', 'is', null)
            .neq('notes', '')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as {
            prefecture_code: string;
            job_category: string;
            notes: string;
            created_at: string;
        }[];
    }
};

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface StatisticsSnapshot {
    id: string;
    slug: string;
    year: number;
    badge_text: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StatisticsKPI {
    id: string;
    snapshot_id: string;
    key: 'total_foreigners' | 'nationalities' | 'avg_salary_national';
    value_numeric: number;
    delta_text: string | null;
    display_prefix: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface StatisticsTopNationality {
    id: string;
    snapshot_id: string;
    rank: number;
    nationality_code: string | null;
    nationality_label: string;
    value_numeric: number;
    created_at: string;
}

export interface StatisticsPrefectureDensity {
    id: string;
    snapshot_id: string;
    prefecture_code: string;
    prefecture_name: string;
    value_numeric: number;
    created_at: string;
}

export interface StatisticsSalaryComparison {
    id: string;
    snapshot_id: string;
    official_status: 'coming_soon' | 'ready';
    official_note: string | null;
    community_value_yen: number | null;
    community_note: string | null;
    created_at: string;
}

export interface StatisticsTourism {
    id: string;
    snapshot_id: string;
    rank: number;
    country_name: string;
    visitor_count: number;
    visitor_label: string;
    created_at: string;
}

export interface CompleteStatisticsData {
    snapshot: StatisticsSnapshot;
    kpis: StatisticsKPI[];
    topNationalities: StatisticsTopNationality[];
    prefectureDensity: StatisticsPrefectureDensity[];
    salaryComparison: StatisticsSalaryComparison | null;
    tourism: StatisticsTourism[];
}

// ============================================================================
// ADMIN STATISTICS SERVICE
// ============================================================================

export const adminStatisticsService = {
    // ------------------------------------------------------------------------
    // SNAPSHOTS
    // ------------------------------------------------------------------------

    async getActiveSnapshot(): Promise<StatisticsSnapshot | null> {
        const { data, error } = await supabase
            .from('statistics_snapshots')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows
            throw error;
        }
        return data;
    },

    async getSnapshotById(id: string): Promise<StatisticsSnapshot> {
        const { data, error } = await supabase
            .from('statistics_snapshots')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async upsertSnapshot(data: {
        id?: string;
        slug: string;
        year: number;
        badge_text: string;
        is_active: boolean;
    }): Promise<StatisticsSnapshot> {
        const payload = {
            ...data,
            updated_at: new Date().toISOString()
        };

        const { data: result, error } = await supabase
            .from('statistics_snapshots')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    // ------------------------------------------------------------------------
    // KPIs
    // ------------------------------------------------------------------------

    async getKPIsBySnapshot(snapshotId: string): Promise<StatisticsKPI[]> {
        const { data, error } = await supabase
            .from('statistics_kpis')
            .select('*')
            .eq('snapshot_id', snapshotId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async upsertKPIs(
        snapshotId: string,
        kpis: Array<{
            key: 'total_foreigners' | 'nationalities' | 'avg_salary_national';
            value_numeric: number;
            delta_text: string | null;
            display_prefix: string | null;
            sort_order: number;
        }>
    ): Promise<StatisticsKPI[]> {
        // Delete existing KPIs for this snapshot
        await supabase
            .from('statistics_kpis')
            .delete()
            .eq('snapshot_id', snapshotId);

        // Insert new KPIs
        const payload = kpis.map(kpi => ({
            snapshot_id: snapshotId,
            ...kpi,
            updated_at: new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('statistics_kpis')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    },

    // ------------------------------------------------------------------------
    // TOP NATIONALITIES
    // ------------------------------------------------------------------------

    async getTopNationalitiesBySnapshot(snapshotId: string): Promise<StatisticsTopNationality[]> {
        const { data, error } = await supabase
            .from('statistics_top_nationalities')
            .select('*')
            .eq('snapshot_id', snapshotId)
            .order('rank', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async upsertTopNationalities(
        snapshotId: string,
        nationalities: Array<{
            rank: number;
            nationality_code: string | null;
            nationality_label: string;
            value_numeric: number;
        }>
    ): Promise<StatisticsTopNationality[]> {
        // Delete existing nationalities for this snapshot
        await supabase
            .from('statistics_top_nationalities')
            .delete()
            .eq('snapshot_id', snapshotId);

        // Insert new nationalities
        const payload = nationalities.map(nat => ({
            snapshot_id: snapshotId,
            ...nat
        }));

        const { data, error } = await supabase
            .from('statistics_top_nationalities')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    },

    // ------------------------------------------------------------------------
    // PREFECTURE DENSITY
    // ------------------------------------------------------------------------

    async getPrefectureDensityBySnapshot(snapshotId: string): Promise<StatisticsPrefectureDensity[]> {
        const { data, error } = await supabase
            .from('statistics_prefecture_density')
            .select('*')
            .eq('snapshot_id', snapshotId)
            .order('prefecture_code', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async upsertPrefectureDensity(
        snapshotId: string,
        densities: Array<{
            prefecture_code: string;
            prefecture_name: string;
            value_numeric: number;
        }>
    ): Promise<StatisticsPrefectureDensity[]> {
        // Delete existing densities for this snapshot
        await supabase
            .from('statistics_prefecture_density')
            .delete()
            .eq('snapshot_id', snapshotId);

        // Insert new densities
        const payload = densities.map(density => ({
            snapshot_id: snapshotId,
            ...density
        }));

        const { data, error } = await supabase
            .from('statistics_prefecture_density')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    },

    async seedPrefectures(snapshotId: string): Promise<StatisticsPrefectureDensity[]> {
        const prefectures = [
            { code: 'JP-01', name: 'Hokkai Do' },
            { code: 'JP-02', name: 'Aomori Ken' },
            { code: 'JP-03', name: 'Iwate Ken' },
            { code: 'JP-04', name: 'Miyagi Ken' },
            { code: 'JP-05', name: 'Akita Ken' },
            { code: 'JP-06', name: 'Yamagata Ken' },
            { code: 'JP-07', name: 'Fukushima Ken' },
            { code: 'JP-08', name: 'Ibaraki Ken' },
            { code: 'JP-09', name: 'Tochigi Ken' },
            { code: 'JP-10', name: 'Gunma Ken' },
            { code: 'JP-11', name: 'Saitama Ken' },
            { code: 'JP-12', name: 'Chiba Ken' },
            { code: 'JP-13', name: 'Tokyo To' },
            { code: 'JP-14', name: 'Kanagawa Ken' },
            { code: 'JP-15', name: 'Niigata Ken' },
            { code: 'JP-16', name: 'Toyama Ken' },
            { code: 'JP-17', name: 'Ishikawa Ken' },
            { code: 'JP-18', name: 'Fukui Ken' },
            { code: 'JP-19', name: 'Yamanashi Ken' },
            { code: 'JP-20', name: 'Nagano Ken' },
            { code: 'JP-21', name: 'Gifu Ken' },
            { code: 'JP-22', name: 'Shizuoka Ken' },
            { code: 'JP-23', name: 'Aichi Ken' },
            { code: 'JP-24', name: 'Mie Ken' },
            { code: 'JP-25', name: 'Shiga Ken' },
            { code: 'JP-26', name: 'Kyoto Fu' },
            { code: 'JP-27', name: 'Osaka Fu' },
            { code: 'JP-28', name: 'Hyogo Ken' },
            { code: 'JP-29', name: 'Nara Ken' },
            { code: 'JP-30', name: 'Wakayama Ken' },
            { code: 'JP-31', name: 'Tottori Ken' },
            { code: 'JP-32', name: 'Shimane Ken' },
            { code: 'JP-33', name: 'Okayama Ken' },
            { code: 'JP-34', name: 'Hiroshima Ken' },
            { code: 'JP-35', name: 'Yamaguchi Ken' },
            { code: 'JP-36', name: 'Tokushima Ken' },
            { code: 'JP-37', name: 'Kagawa Ken' },
            { code: 'JP-38', name: 'Ehime Ken' },
            { code: 'JP-39', name: 'Kochi Ken' },
            { code: 'JP-40', name: 'Fukuoka Ken' },
            { code: 'JP-41', name: 'Saga Ken' },
            { code: 'JP-42', name: 'Nagasaki Ken' },
            { code: 'JP-43', name: 'Kumamoto Ken' },
            { code: 'JP-44', name: 'Oita Ken' },
            { code: 'JP-45', name: 'Miyazaki Ken' },
            { code: 'JP-46', name: 'Kagoshima Ken' },
            { code: 'JP-47', name: 'Okinawa Ken' }
        ];

        const payload = prefectures.map(pref => ({
            snapshot_id: snapshotId,
            prefecture_code: pref.code,
            prefecture_name: pref.name,
            value_numeric: 0
        }));

        const { data, error } = await supabase
            .from('statistics_prefecture_density')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    },

    // ------------------------------------------------------------------------
    // SALARY COMPARISON
    // ------------------------------------------------------------------------

    async getSalaryComparisonBySnapshot(snapshotId: string): Promise<StatisticsSalaryComparison | null> {
        const { data, error } = await supabase
            .from('statistics_salary_comparison')
            .select('*')
            .eq('snapshot_id', snapshotId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows
            throw error;
        }
        return data;
    },

    async upsertSalaryComparison(
        snapshotId: string,
        salaryData: {
            official_status: 'coming_soon' | 'ready';
            official_note: string | null;
            community_value_yen: number | null;
            community_note: string | null;
        }
    ): Promise<StatisticsSalaryComparison> {
        const payload = {
            snapshot_id: snapshotId,
            ...salaryData
        };

        const { data, error } = await supabase
            .from('statistics_salary_comparison')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ------------------------------------------------------------------------
    // TOURISM (FOREIGN VISITORS)
    // ------------------------------------------------------------------------

    async getTourismBySnapshot(snapshotId: string): Promise<StatisticsTourism[]> {
        const { data, error } = await supabase
            .from('statistics_tourism')
            .select('*')
            .eq('snapshot_id', snapshotId)
            .order('rank', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async upsertTourism(
        snapshotId: string,
        tourism: Array<{
            rank: number;
            country_name: string;
            visitor_count: number;
            visitor_label: string;
        }>
    ): Promise<StatisticsTourism[]> {
        // Delete existing tourism data for this snapshot
        await supabase
            .from('statistics_tourism')
            .delete()
            .eq('snapshot_id', snapshotId);

        // Insert new tourism data
        const payload = tourism.map(item => ({
            snapshot_id: snapshotId,
            ...item
        }));

        const { data, error } = await supabase
            .from('statistics_tourism')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    },

    // ------------------------------------------------------------------------
    // COMPLETE DATA FETCH
    // ------------------------------------------------------------------------

    async getCompleteStatistics(snapshotId?: string): Promise<CompleteStatisticsData | null> {
        let snapshot: StatisticsSnapshot | null;

        if (snapshotId) {
            snapshot = await this.getSnapshotById(snapshotId);
        } else {
            snapshot = await this.getActiveSnapshot();
        }

        if (!snapshot) return null;

        const [kpis, topNationalities, prefectureDensity, salaryComparison, tourism] = await Promise.all([
            this.getKPIsBySnapshot(snapshot.id),
            this.getTopNationalitiesBySnapshot(snapshot.id),
            this.getPrefectureDensityBySnapshot(snapshot.id),
            this.getSalaryComparisonBySnapshot(snapshot.id),
            this.getTourismBySnapshot(snapshot.id)
        ]);

        return {
            snapshot,
            kpis,
            topNationalities,
            prefectureDensity,
            salaryComparison,
            tourism
        };
    }
};

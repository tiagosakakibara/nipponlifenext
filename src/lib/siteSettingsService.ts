import { supabase } from './supabaseClient';

export interface SiteSetting {
    key: string;
    value: string; // URL or text
    type: 'image' | 'video' | 'youtube' | 'text';
    updated_at: string;
}

export const siteSettingsService = {
    async getSetting(key: string) {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', key)
            .single();

        return { data, error };
    },

    async getAllSettings() {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        const settingsMap: Record<string, string> = {};
        data?.forEach((s: any) => {
            settingsMap[s.key] = s.value;
        });

        return { settings: settingsMap, error };
    },

    async setSetting(key: string, value: string, type: 'image' | 'video' | 'youtube' | 'text') {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({
                key,
                value,
                type,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        return { data, error };
    }
};

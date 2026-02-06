"use client";

import { useState, useCallback } from 'react';
import { siteSettingsService } from '@/lib/siteSettingsService';
import { toast } from 'react-hot-toast';

export function useAdminSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { settings: data, error } = await siteSettingsService.getAllSettings();
            if (error) throw error;
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSetting = async (key: string, value: string, type: any = 'text') => {
        try {
            const { error } = await siteSettingsService.setSetting(key, value, type);
            if (error) throw error;
            fetchSettings();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configuração');
            return false;
        }
    };

    return {
        settings,
        loading,
        fetchSettings,
        updateSetting
    };
}

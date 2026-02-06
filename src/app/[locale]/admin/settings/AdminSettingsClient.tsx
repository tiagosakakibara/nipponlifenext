"use client";

import { useEffect, useState } from 'react';
import {
    Settings, Globe, Shield, Mail, Bell,
    Save, Loader2, Info, Layout, Share2
} from 'lucide-react';
import { useAdminSettings } from './hooks/useAdminSettings';
import { toast } from 'react-hot-toast';

export default function AdminSettingsClient() {
    const { settings, loading, fetchSettings, updateSetting } = useAdminSettings();
    const [saving, setSaving] = useState(false);

    // Local state for all settings (flattened)
    const [formData, setFormData] = useState<any>({
        site_title: '',
        site_tagline: '',
        admin_email: '',
        contact_whatsapp: '',
        site_logo_url: ''
    });

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                site_title: settings.site_title || '',
                site_tagline: settings.site_tagline || '',
                admin_email: settings.admin_email || '',
                contact_whatsapp: settings.contact_whatsapp || '',
                site_logo_url: settings.site_logo_url || ''
            });
        }
    }, [settings]);

    const handleSave = async (key: string, value: string) => {
        setSaving(true);
        const success = await updateSetting(key, value);
        if (success) toast.success(`Setting '${key}' updated`);
        setSaving(false);
    };

    const handleSaveAll = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            for (const [key, value] of Object.entries(formData)) {
                if (settings[key] !== value) {
                    await updateSetting(key, value as string);
                }
            }
            toast.success('All settings synchronized');
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">System Preferences</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">Global configuration and brand identity</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        form="settings-form"
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        SYNC CONFIGURATION
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-link animate-spin" />
                    <p className="text-secondary/50 font-black uppercase tracking-[0.2em] text-[10px]">Harvesting System Metadata...</p>
                </div>
            ) : (
                <form id="settings-form" onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel: General */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 text-primary">
                                <Layout className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight text-[#003768]">Brand Core</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-[0.2em] mb-1.5 transition-colors group-hover:text-link">Identity Title</label>
                                    <input
                                        value={formData.site_title}
                                        onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                                        placeholder="e.g. NipponLife Portal"
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-xl font-black text-[#003768] focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-[0.2em] mb-1.5 transition-colors group-hover:text-link">Marketing Tagline</label>
                                    <textarea
                                        value={formData.site_tagline}
                                        onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                                        placeholder="Your gateway to Japanese culture..."
                                        rows={2}
                                        className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none resize-none"
                                    />
                                    <p className="text-[9px] text-[#5593C3] font-black uppercase tracking-widest mt-2 px-2 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Visible on major SEO search results and social shares.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 text-primary">
                                <Mail className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight text-[#003768]">Communication Channels</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-[0.2em] mb-1.5">Administrative Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30 group-focus-within:text-link transition-colors" />
                                        <input
                                            type="email"
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-[0.2em] mb-1.5">Support WhatsApp</label>
                                    <div className="relative group">
                                        <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30 group-focus-within:text-link transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.contact_whatsapp}
                                            onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                                            placeholder="+81 00-0000-0000"
                                            className="w-full pl-11 pr-4 py-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Assets */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#003768] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <Globe className="w-10 h-10 text-white/40 mb-6" />
                            <h4 className="text-xl font-black mb-2 tracking-tight">Deployment Status</h4>
                            <p className="text-white/60 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">
                                Your system settings are synced across production servers every 5 minutes.
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Connection</span>
                            </div>
                        </div>

                        <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <Shield className="w-5 h-5 text-link" />
                                <h3 className="font-black text-lg tracking-tight text-[#003768]">Security Info</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-app rounded-2xl border border-app">
                                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest mb-1">Server Region</p>
                                    <p className="text-xs font-bold text-[#5593C3] uppercase tracking-widest">Tokyo (ap-northeast-1)</p>
                                </div>
                                <div className="p-4 bg-app rounded-2xl border border-app">
                                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest mb-1">Last DB Synced</p>
                                    <p className="text-xs font-bold text-primary">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}


"use client";

import { useEffect, useState } from 'react';
import {
    Info,
    Save,
    Loader2,
    FileText,
    Shield,
    ScrollText,
    Heart,
    Globe
} from 'lucide-react';
import { useAdminSettings } from '../settings/hooks/useAdminSettings';
import { toast } from 'react-hot-toast';

type Language = 'pt' | 'ja' | 'en';

export default function FooterSettingsClient() {
    const { settings, loading, fetchSettings, updateSetting } = useAdminSettings();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>('privacy');
    const [activeLang, setActiveLang] = useState<Language>('pt');

    // Local state to manage form data
    const [formData, setFormData] = useState({
        privacy_policy: '',
        privacy_policy_ja: '',
        privacy_policy_en: '',
        terms_of_service: '',
        terms_of_service_ja: '',
        terms_of_service_en: '',
        about_us: '',
        about_us_ja: '',
        about_us_en: ''
    });

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            setFormData({
                privacy_policy: settings.privacy_policy || '',
                privacy_policy_ja: settings.privacy_policy_ja || '',
                privacy_policy_en: settings.privacy_policy_en || '',

                terms_of_service: settings.terms_of_service || '',
                terms_of_service_ja: settings.terms_of_service_ja || '',
                terms_of_service_en: settings.terms_of_service_en || '',

                about_us: settings.about_us || '',
                about_us_ja: settings.about_us_ja || '',
                about_us_en: settings.about_us_en || ''
            });
        }
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all fields
            await Promise.all([
                updateSetting('privacy_policy', formData.privacy_policy, 'text'),
                updateSetting('privacy_policy_ja', formData.privacy_policy_ja, 'text'),
                updateSetting('privacy_policy_en', formData.privacy_policy_en, 'text'),

                updateSetting('terms_of_service', formData.terms_of_service, 'text'),
                updateSetting('terms_of_service_ja', formData.terms_of_service_ja, 'text'),
                updateSetting('terms_of_service_en', formData.terms_of_service_en, 'text'),

                updateSetting('about_us', formData.about_us, 'text'),
                updateSetting('about_us_ja', formData.about_us_ja, 'text'),
                updateSetting('about_us_en', formData.about_us_en, 'text')
            ]);
            toast.success('Conteúdo do rodapé atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar conteúdo');
        } finally {
            setSaving(false);
        }
    };

    const getFieldForTab = (tab: typeof activeTab, lang: Language) => {
        switch (tab) {
            case 'privacy': return lang === 'pt' ? 'privacy_policy' : `privacy_policy_${lang}`;
            case 'terms': return lang === 'pt' ? 'terms_of_service' : `terms_of_service_${lang}`;
            case 'about': return lang === 'pt' ? 'about_us' : `about_us_${lang}`;
            default: return 'privacy_policy';
        }
    };

    const getCurrentValue = () => {
        const field = getFieldForTab(activeTab, activeLang);
        return formData[field as keyof typeof formData];
    };

    const handleContentChange = (val: string) => {
        const field = getFieldForTab(activeTab, activeLang);
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Gerenciamento do Rodapé</h1>
                    <p className="text-secondary mt-1 font-medium italic opacity-60">
                        Edite o conteúdo das páginas institucionais (Privacidade, Termos, Sobre)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        SALVAR ALTERAÇÕES
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-[var(--nl-accent)] animate-spin" />
                    <p className="text-secondary/50 font-black uppercase tracking-[0.2em] text-[10px]">Carregando conteúdo...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${activeTab === 'privacy'
                                    ? 'bg-[#5593C3]/10 border-[#5593C3] text-[#5593C3]'
                                    : 'bg-surface border-transparent hover:bg-surface/80 text-secondary'
                                }`}
                        >
                            <Shield className="w-5 h-5" />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Privacidade</span>
                                <span className="text-[10px] opacity-70">Política de Privacidade</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${activeTab === 'terms'
                                    ? 'bg-[#5593C3]/10 border-[#5593C3] text-[#5593C3]'
                                    : 'bg-surface border-transparent hover:bg-surface/80 text-secondary'
                                }`}
                        >
                            <ScrollText className="w-5 h-5" />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Termos de Uso</span>
                                <span className="text-[10px] opacity-70">Termos e Condições</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('about')}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${activeTab === 'about'
                                    ? 'bg-[#5593C3]/10 border-[#5593C3] text-[#5593C3]'
                                    : 'bg-surface border-transparent hover:bg-surface/80 text-secondary'
                                }`}
                        >
                            <Heart className="w-5 h-5" />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Sobre Nós</span>
                                <span className="text-[10px] opacity-70">História e Missão</span>
                            </div>
                        </button>
                    </div>

                    {/* Content Editor Area */}
                    <div className="lg:col-span-3 bg-surface rounded-3xl border border-app p-8 shadow-sm">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 text-primary">
                                {activeTab === 'privacy' && <Shield className="w-6 h-6 text-[#5593C3]" />}
                                {activeTab === 'terms' && <ScrollText className="w-6 h-6 text-[#5593C3]" />}
                                {activeTab === 'about' && <Heart className="w-6 h-6 text-[#5593C3]" />}

                                <h3 className="font-black text-xl tracking-tight">
                                    {activeTab === 'privacy' && 'Política de Privacidade'}
                                    {activeTab === 'terms' && 'Termos de Uso'}
                                    {activeTab === 'about' && 'Sobre o NipponLife'}
                                </h3>
                            </div>

                            {/* Language Switcher */}
                            <div className="flex items-center gap-2 p-1 bg-app rounded-lg border border-app">
                                <button
                                    onClick={() => setActiveLang('pt')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeLang === 'pt' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                                >
                                    Português
                                </button>
                                <button
                                    onClick={() => setActiveLang('ja')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeLang === 'ja' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                                >
                                    日本語
                                </button>
                                <button
                                    onClick={() => setActiveLang('en')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeLang === 'en' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
                                >
                                    English
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-app/50 rounded-xl border border-app mb-6 text-sm text-secondary">
                            <p className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Editando conteúdo em: <strong>{activeLang === 'pt' ? 'Português' : activeLang === 'ja' ? 'Japonês' : 'Inglês'}</strong>
                            </p>
                        </div>

                        <textarea
                            value={getCurrentValue()}
                            onChange={(e) => handleContentChange(e.target.value)}
                            className="w-full h-[600px] p-6 bg-app border border-app rounded-2xl text-sm font-mono text-primary focus:bg-white transition-all outline-none resize-none leading-relaxed"
                            placeholder="<p>Escreva seu conteúdo em HTML aqui...</p>"
                        />

                    </div>
                </div>
            )}
        </div>
    );
}

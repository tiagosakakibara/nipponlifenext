'use client';

import { useState, useRef, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { HelpCircle, Lock, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { QUESTION_CATEGORIES } from '@/types/community';
import { Link, useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

export function PublishQuestionForm() {
    const t = useTranslations();
    const { user } = useAuth();
    const router = useRouter();
    const [questionTitle, setQuestionTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!user) {
            router.push('/login');
            return;
        }

        if (!questionTitle.trim() || !description.trim()) return;

        try {
            setSubmitting(true);

            // Create slug
            const slug = questionTitle
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);

            const { data, error } = await supabase
                .from('community_questions')
                .insert({
                    title: questionTitle.trim(),
                    body: description.trim(),
                    category: category || null,
                    author_id: user.id,
                    slug: slug
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(t('community.questions.success', { defaultMessage: 'Pergunta publicada!' }));
            setQuestionTitle('');
            setDescription('');
            setCategory('');

            // Refresh page (soft refresh)
            router.refresh();

        } catch (error) {
            console.error('Error publishing question:', error);
            toast.error(t('community.questions.error', { defaultMessage: 'Erro ao publicar.' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-surface border border-app rounded-2xl shadow-sm overflow-hidden scroll-mt-24">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-app">
                <h2 className="font-heading font-bold text-primary text-lg">{t('community.questions.publishTitle', { defaultMessage: 'Tire sua dúvida' })}</h2>
                <HelpCircle className="w-5 h-5 text-[#5593C3]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">
                        {t('community.questions.formTitleLabel', { defaultMessage: 'Título da pergunta' })}
                    </label>
                    <input
                        type="text"
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        placeholder={t('community.questions.formTitlePlaceholder', { defaultMessage: 'Ex: Como renovar o visto de trabalho?' })}
                        className="w-full px-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                        disabled={submitting || !user}
                    />
                </div>

                {/* Category Select */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">
                        {t('community.questions.formCategoryLabel', { defaultMessage: 'Categoria' })}
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="relative flex-1">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 border border-app rounded-xl bg-app text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] appearance-none cursor-pointer transition-all"
                                disabled={submitting || !user}
                            >
                                <option value="">{t('admin.selectCategory', { defaultMessage: 'Selecione uma categoria...' })}</option>
                                {QUESTION_CATEGORIES.map((cat) => {
                                    const CATEGORY_MAP: Record<string, string> = {
                                        'Visto e imigração': 'visto',
                                        'Saúde e seguros': 'saude',
                                        'Trabalho': 'trabalho',
                                        'Moradia': 'moradia',
                                        'Documentos e registros': 'documentos',
                                        'Convivência e cultura': 'cultura',
                                        'Outros': 'outros'
                                    };
                                    const catKey = CATEGORY_MAP[cat] || cat;
                                    return (
                                        <option key={cat} value={cat}>
                                            {t(`community.categories.${catKey}`, { defaultMessage: cat })}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Description Textarea */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">
                        {t('community.questions.formDescriptionLabel', { defaultMessage: 'Detalhes (opcional)' })}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('community.questions.formDescriptionPlaceholder', { defaultMessage: 'Descreva melhor sua dúvida...' })}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] resize-none transition-all"
                        disabled={submitting || !user}
                    />
                </div>
            </form>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-app bg-surface">
                <div className="flex items-center gap-2 text-muted text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{user ? t('community.questions.loggedInToPublish', { defaultMessage: 'Você está logado' }) : t('community.questions.loginToPublish', { defaultMessage: 'Faça login para perguntar' })}</span>
                </div>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting || !questionTitle.trim() || !user}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#D70F24] hover:bg-[#b80d1f] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? t('community.questions.publishing', { defaultMessage: 'Publicando...' }) : t('community.questions.publishButton', { defaultMessage: 'Publicar Dúvida' })}
                </button>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag, ChevronRight, Loader2, Save, X } from 'lucide-react';
import { useAdminCategories } from './hooks/useAdminCategories';
import { useTranslations } from 'next-intl';

export default function AdminCategoriesClient() {
    const t = useTranslations('admin');
    const {
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory
    } = useAdminCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [editingCat, setEditingCat] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) return;

        setSaving(true);
        let success = false;
        if (editingCat) {
            success = await updateCategory(editingCat.slug, { name: formData.name });
        } else {
            success = await addCategory({ name: formData.name, slug: formData.slug });
        }

        if (success) {
            setFormData({ name: '', slug: '' });
            setEditingCat(null);
        }
        setSaving(false);
    };

    const handleEdit = (cat: any) => {
        setEditingCat(cat);
        setFormData({ name: cat.name, slug: cat.slug });
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight">Content Taxonomies</h1>
                <p className="text-secondary mt-1 font-medium italic opacity-60">Manage categories for news and articles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-4">
                    <div className="bg-surface rounded-3xl border border-app p-8 shadow-sm space-y-6 sticky top-8">
                        <div className="flex items-center gap-3 text-primary">
                            <Plus className="w-5 h-5 text-link" />
                            <h3 className="font-black text-lg tracking-tight">
                                {editingCat ? 'Modify Category' : 'New Classification'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5 px-1">Display Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Travel & Tours"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-sm font-bold text-primary focus:bg-white transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold text-secondary uppercase block tracking-widest mb-1.5 px-1">Unique Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    disabled={!!editingCat}
                                    placeholder="e.g. travel-tours"
                                    className="w-full p-4 bg-app border border-app rounded-2xl text-[10px] font-mono font-bold text-link focus:bg-white transition-all outline-none disabled:opacity-40"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 bg-[#5593C3] hover:bg-[#467ba5] text-white px-6 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCat ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {editingCat ? 'UPDATE CHANGES' : 'CREATE CATEGORY'}
                                </button>
                                {editingCat && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCat(null);
                                            setFormData({ name: '', slug: '' });
                                        }}
                                        className="flex items-center justify-center gap-2 bg-white border border-app text-secondary hover:bg-app px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Discard Changes
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8">
                    <div className="bg-surface rounded-3xl border border-app shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-app bg-[#0037680a] flex items-center justify-between">
                            <div className="relative w-full max-w-xs group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40 group-focus-within:text-link transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Filter list..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-app rounded-2xl text-xs font-bold text-primary placeholder:text-secondary/30 outline-none focus:border-link/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#00376805] text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app">
                                    <tr>
                                        <th className="px-6 py-5 whitespace-nowrap">Taxonomy Label</th>
                                        <th className="px-6 py-5 whitespace-nowrap">System URL Slug</th>
                                        <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-app">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 text-link animate-spin" />
                                                    <span className="text-secondary/50 font-bold uppercase tracking-widest text-[10px]">Processing Database...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center text-secondary/40 italic font-medium">
                                                No categories found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-[#00376805] group transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-app border border-app flex items-center justify-center text-[#5593C3] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                            <Tag className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-primary group-hover:text-link transition-colors text-base">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-mono font-bold text-secondary/40 group-hover:text-link transition-colors uppercase tracking-widest bg-app/50 px-2.5 py-1 rounded-lg border border-app">
                                                        {cat.slug}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 translate-x-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all">
                                                        <button
                                                            onClick={() => handleEdit(cat)}
                                                            className="p-3 text-secondary hover:text-link hover:bg-link/10 rounded-xl transition-all"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCategory(cat.slug)}
                                                            className="p-3 text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-app bg-[#00376802] text-center">
                            <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">Total Entries: {filtered.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

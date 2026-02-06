"use client";

import { useState, useCallback } from 'react';
import { categoryService, Category } from '@/lib/categoryService';
import { toast } from 'react-hot-toast';

export function useAdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    }, []);

    const addCategory = async (data: { slug: string; name: string }) => {
        try {
            await categoryService.createCategory(data);
            toast.success('Categoria criada');
            fetchCategories();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar categoria');
            return false;
        }
    };

    const updateCategory = async (slug: string, data: { name: string }) => {
        try {
            await categoryService.updateCategory(slug, data);
            toast.success('Categoria atualizada');
            fetchCategories();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar categoria');
            return false;
        }
    };

    const deleteCategory = async (slug: string) => {
        if (!window.confirm('Excluir esta categoria?')) return false;
        try {
            await categoryService.deleteCategory(slug);
            toast.success('Categoria excluída');
            fetchCategories();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir categoria');
            return false;
        }
    };

    return {
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory
    };
}

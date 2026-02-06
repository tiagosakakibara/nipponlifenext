"use client";

import { useState, useCallback } from 'react';
import { businessService } from '@/lib/businessService';
import { Business, BusinessFormData } from '@/types/business';
import { toast } from 'react-hot-toast';

export function useAdminBusiness() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 10;

    const fetchBusinesses = useCallback(async (currentPage: number, search?: string) => {
        setLoading(true);
        try {
            const { data, count } = await businessService.getAdminBusinesses(currentPage, ITEMS_PER_PAGE, search);
            setBusinesses(data);
            setTotalCount(count || 0);
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            } else {
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
            toast.error('Erro ao carregar guia de empresas');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteBusiness = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return false;

        try {
            await businessService.deleteBusiness(id);
            toast.success('Empresa excluída com sucesso');
            // Refresh current page
            fetchBusinesses(page);
            return true;
        } catch (error) {
            console.error('Error deleting business:', error);
            toast.error('Erro ao excluir empresa');
            return false;
        }
    };

    const getBusiness = async (id: string) => {
        try {
            return await businessService.getBusinessById(id);
        } catch (error) {
            console.error('Error getting business:', error);
            toast.error('Erro ao carregar dados da empresa');
            return null;
        }
    };

    return {
        businesses,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        fetchBusinesses,
        deleteBusiness,
        getBusiness
    };
}

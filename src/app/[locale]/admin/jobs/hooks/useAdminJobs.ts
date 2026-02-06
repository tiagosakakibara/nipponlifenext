"use client";

import { useState, useCallback } from 'react';
import { jobsService } from '@/lib/jobsService';
import { Job } from '@/types/job';
import { toast } from 'react-hot-toast';

export function useAdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const fetchJobs = useCallback(async (currentPage: number, search?: string) => {
        setLoading(true);
        try {
            const { data, count } = await jobsService.getAdminJobs(currentPage, ITEMS_PER_PAGE, search);
            setJobs(data);
            setTotalCount(count || 0);
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            } else {
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Erro ao carregar vagas');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteJob = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta vaga?')) return false;

        try {
            await jobsService.deleteJob(id);
            toast.success('Vaga excluída com sucesso');
            fetchJobs(page);
            return true;
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Erro ao excluir vaga');
            return false;
        }
    };

    return {
        jobs,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        fetchJobs,
        deleteJob
    };
}

"use client";

import { useState, useCallback } from 'react';
import { getAllProfiles, updateUserRole, updateUserStatus } from '@/lib/profileService';
import { toast } from 'react-hot-toast';

export function useAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await getAllProfiles();
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, []);

    const changeRole = async (userId: string, role: string) => {
        try {
            const { error } = await updateUserRole(userId, role);
            if (error) throw error;
            toast.success('Regra alterada');
            fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar regra');
            return false;
        }
    };

    const changeStatus = async (userId: string, status: string, reason?: string, until?: string) => {
        try {
            const { error } = await updateUserStatus(userId, status, reason, until);
            if (error) throw error;
            toast.success('Status alterado');
            fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar status');
            return false;
        }
    };

    return {
        users,
        loading,
        fetchUsers,
        changeRole,
        changeStatus
    };
}

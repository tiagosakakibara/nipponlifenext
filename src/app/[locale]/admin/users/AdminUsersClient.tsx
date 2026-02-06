"use client";

import { useEffect, useState } from 'react';
import {
    Users, Search, Shield, UserCheck, Clock, Ban,
    MoreHorizontal, Loader2, Camera, Mail,
    CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import { useAdminUsers } from './hooks/useAdminUsers';
import { storageService } from '@/lib/storageService';
import { toast } from 'react-hot-toast';

export default function AdminUsersClient() {
    const { users, loading, fetchUsers, changeRole, changeStatus } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!window.confirm(`Mudar cargo para ${newRole}?`)) return;
        setUpdatingId(userId);
        await changeRole(userId, newRole);
        setUpdatingId(null);
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        let reason = undefined;
        let until = undefined;

        if (newStatus !== 'active') {
            reason = window.prompt('Motivo:') || '';
            if (newStatus === 'suspended') {
                until = window.prompt('Suspenso até (ISO):', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) || '';
            }
        }

        if (!window.confirm(`Alterar status para ${newStatus}?`)) return;

        setUpdatingId(userId);
        await changeStatus(userId, newStatus, reason, until);
        setUpdatingId(null);
    };

    const filtered = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="bg-[#003768] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"><Shield className="w-3 h-3" /> System Admin</span>;
            case 'photographer':
                return <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Camera className="w-3 h-3" /> Photographer</span>;
            default:
                return <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> Standard User</span>;
        }
    };

    const getStatusBadge = (user: any) => {
        if (user.status === 'banned') return <span className="text-red-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><Ban className="w-3 h-3" /> Restricted</span>;
        if (user.status === 'suspended') return <span className="text-amber-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Suspended</span>;
        return <span className="text-emerald-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-primary tracking-tight">Citizen Management</h1>
                <p className="text-secondary mt-1 font-medium italic opacity-60">Audit system permissions and account statuses</p>
            </div>

            {/* Filters */}
            <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm flex flex-col lg:flex-row items-center gap-6">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-link transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by name, username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-app/50 border border-app rounded-2xl text-sm font-bold text-primary placeholder:text-secondary/20 outline-none focus:border-link transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    {['all', 'admin', 'photographer', 'user'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role
                                    ? 'bg-[#5593C3] text-white shadow-xl shadow-blue-500/20'
                                    : 'bg-white border border-app text-secondary hover:bg-app'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-[40px] border border-app shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#00376805] text-[#5593C3] text-[10px] font-black uppercase tracking-[0.2em] border-b border-app">
                            <tr>
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Privileges</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Administrative</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-link animate-spin" />
                                            <span className="text-secondary/40 font-black uppercase tracking-widest text-[10px]">Retrieving Citizens Registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center text-secondary/30 italic font-medium">
                                        No matches found for your current filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id} className="group hover:bg-[#00376802] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={storageService.getFileUrl(user.avatar_url)}
                                                            alt=""
                                                            className="w-14 h-14 rounded-[20px] object-cover ring-4 ring-white shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-[20px] bg-app border border-app flex items-center justify-center text-secondary/20 shadow-inner">
                                                            <Users className="w-7 h-7" />
                                                        </div>
                                                    )}
                                                    {user.status === 'active' && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-primary group-hover:text-link transition-colors text-lg tracking-tight leading-tight">
                                                        {user.full_name || 'Anonymous User'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-mono font-black text-secondary/40">@{user.username || 'unknown'}</span>
                                                        <span className="w-1 h-1 bg-app rounded-full" />
                                                        <span className="text-[10px] font-bold text-secondary/40">{user.email || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                {getStatusBadge(user)}
                                                {user.ban_reason && (
                                                    <p className="text-[9px] text-red-400 font-medium italic line-clamp-1 max-w-[120px]" title={user.ban_reason}>
                                                        "{user.ban_reason}"
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {updatingId === user.id ? (
                                                    <Loader2 className="w-5 h-5 text-link animate-spin" />
                                                ) : (
                                                    <>
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleRoleChange(user.id, 'admin')}
                                                                className="px-4 py-2 bg-[#0037680a] hover:bg-[#003768] text-[#003768] hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                            >
                                                                Make Admin
                                                            </button>
                                                        )}
                                                        {user.status === 'active' ? (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'banned')}
                                                                className="p-3 text-secondary/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                                                title="Ban Account"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'active')}
                                                                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                Restore
                                                            </button>
                                                        )}
                                                        <button className="p-3 text-secondary/30 hover:text-link hover:bg-link/10 rounded-2xl transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

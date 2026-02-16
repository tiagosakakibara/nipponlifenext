"use client";

import { useEffect, useState } from 'react';
import {
    Users, Search, Shield, UserCheck, Clock, Ban,
    MoreHorizontal, Loader2, Camera, Mail,
    CheckCircle2, XCircle, AlertTriangle, Trash2,
    Briefcase, Building2, Film, Calendar
} from 'lucide-react';
import { useAdminUsers } from './hooks/useAdminUsers';
import { storageService } from '@/lib/storageService';
import { useTranslations } from 'next-intl';

export default function AdminUsersClient() {
    const t = useTranslations('admin.users');
    const { users, loading, fetchUsers, changeRole, changeStatus, deleteUser } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!window.confirm(t('messages.confirmRoleChange', { role: newRole }))) return;
        setUpdatingId(userId);
        await changeRole(userId, newRole);
        setUpdatingId(null);
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        let reason = undefined;
        let until = undefined;

        if (newStatus !== 'active') {
            reason = window.prompt(t('messages.enterReason')) || '';
            if (newStatus === 'suspended') {
                until = window.prompt(t('messages.enterUntil'), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) || '';
            }
        }

        if (!window.confirm(t('messages.confirmStatusChange', { status: newStatus }))) return;

        setUpdatingId(userId);
        await changeStatus(userId, newStatus, reason, until);
        setUpdatingId(null);
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(t('messages.confirmDeleteUser', { name: userName }))) return;
        setUpdatingId(userId);
        await deleteUser(userId);
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
                return <span className="bg-blue-700 dark:bg-blue-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-blue-500/20"><Shield className="w-3 h-3" /> {t('roles.admin')}</span>;
            case 'photographer':
                return <span className="bg-purple-200 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Camera className="w-3 h-3" /> {t('roles.photographer')}</span>;
            default:
                return <span className="bg-zinc-200 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700/50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> {t('roles.user')}</span>;
        }
    };

    const getStatusBadge = (user: any) => {
        if (user.status === 'banned') return <span className="text-red-500 dark:text-red-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><Ban className="w-3 h-3" /> {t('status.banned')}</span>;
        if (user.status === 'suspended') return <span className="text-amber-500 dark:text-amber-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> {t('status.suspended')}</span>;
        return <span className="text-emerald-500 dark:text-emerald-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('status.active')}</span>;
    };

    const renderPermissions = (user: any) => {
        if (user.role === 'admin') {
            return (
                <div className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Shield className="w-3 h-3" />
                    <span>ACESSO TOTAL</span>
                </div>
            );
        }

        if (!user.content_creation_access || user.content_creation_access.length === 0) return <span className="text-secondary/20 font-black text-[9px] uppercase tracking-widest">—</span>;

        const approved = user.content_creation_access.filter((a: any) => a.status === 'approved');

        if (approved.length === 0) return <span className="text-secondary/20 font-black text-[9px] uppercase tracking-widest">—</span>;

        return (
            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                {approved.map((access: any) => {
                    let Icon = UserCheck;
                    let label = access.access_type;
                    let colorClass = "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";

                    switch (access.access_type) {
                        case 'events':
                            Icon = Calendar;
                            label = "Eventos";
                            colorClass = "bg-orange-500/10 text-orange-600 dark:text-orange-400";
                            break;
                        case 'jobs':
                            Icon = Briefcase;
                            label = "Vagas";
                            colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                            break;
                        case 'businesses':
                            Icon = Building2;
                            label = "Negócios";
                            colorClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
                            break;
                        case 'galleries':
                            Icon = Camera;
                            label = "Galerias";
                            colorClass = "bg-pink-500/10 text-pink-600 dark:text-pink-400";
                            break;
                        case 'reels':
                            Icon = Film;
                            label = "Reels";
                            colorClass = "bg-red-500/10 text-red-600 dark:text-red-400";
                            break;
                    }

                    return (
                        <div key={access.access_type} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${colorClass}`} title={label}>
                            <Icon className="w-3 h-3" />
                            <span className="hidden xl:inline">{label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const filterKeyMap: Record<string, string> = {
        all: 'all',
        admin: 'admins',
        photographer: 'photographers',
        user: 'users'
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-primary tracking-tight">{t('title')}</h1>
                <p className="text-secondary mt-1 font-medium italic opacity-60">{t('subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm flex flex-col lg:flex-row items-center gap-6">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-link transition-colors" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-app/50 border border-app rounded-2xl text-sm font-bold text-primary placeholder:text-secondary/20 outline-none focus:border-link transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    {['all', 'admin', 'user'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role
                                ? 'bg-[#5593C3] text-white shadow-xl shadow-blue-500/20'
                                : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            {t(`filters.${filterKeyMap[role]}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-[40px] border border-app shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-blue-100 dark:bg-blue-900/10 text-blue-800 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-blue-200 dark:border-blue-900/20">
                            <tr>
                                <th className="px-8 py-6">{t('table.user')}</th>
                                <th className="px-8 py-6">{t('table.role')}</th>
                                <th className="px-8 py-6">Permissões</th>
                                <th className="px-8 py-6">{t('table.status')}</th>
                                <th className="px-8 py-6 text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-12 h-12 text-link animate-spin" />
                                            <span className="text-secondary/40 font-black uppercase tracking-widest text-[10px]">{t('messages.loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center text-secondary/30 italic font-medium">
                                        {t('filters.noResults')}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id} className="group hover:bg-[#00376802] dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={storageService.getFileUrl(user.avatar_url)}
                                                            alt=""
                                                            className="w-14 h-14 rounded-[20px] object-cover ring-4 ring-white dark:ring-zinc-800 shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-[20px] bg-app border border-app flex items-center justify-center text-secondary/20 shadow-inner">
                                                            <Users className="w-7 h-7" />
                                                        </div>
                                                    )}
                                                    {user.status === 'active' && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm" />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-primary group-hover:text-link transition-colors text-lg tracking-tight leading-tight">
                                                        {user.full_name || t('unnamed')}
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
                                            {renderPermissions(user)}
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
                                                                className="px-4 py-2 bg-[#0037680a] hover:bg-[#003768] dark:bg-blue-500/10 dark:hover:bg-blue-600 text-[#003768] dark:text-blue-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                            >
                                                                {t('actions.makeAdmin')}
                                                            </button>
                                                        )}
                                                        {user.status === 'active' ? (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'banned')}
                                                                className="p-3 text-secondary/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                                                title={t('actions.ban')}
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, 'active')}
                                                                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                {t('actions.reactivate')}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.full_name || t('unnamed'))}
                                                            className="p-3 text-zinc-400/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                                                            title={t('actions.delete')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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

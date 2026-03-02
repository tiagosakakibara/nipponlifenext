'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Clock, Loader2, User, Calendar, Trash2 } from 'lucide-react';

type AccessRequest = {
    id: string;
    user_id: string;
    access_type: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    profiles?: {
        username: string;
        full_name: string;
        role?: string;
    };
};

export default function AccessRequestsClient() {
    const t = useTranslations('admin');
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [processing, setProcessing] = useState<string | null>(null);

    async function fetchRequests() {
        setLoading(true);
        const supabase = createClient();

        let query = supabase
            .from('content_creation_access')
            .select(`
                *,
                profiles:profiles!content_creation_access_user_id_fkey (
                    username,
                    full_name,
                    role
                )
            `)
            .order('requested_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching requests:', error);
        } else {
            // Filter out admins
            const filteredData = (data || []).filter((req: any) => req.profiles?.role !== 'admin');
            setRequests(filteredData);
        }

        setLoading(false);
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    async function handleApprove(requestId: string) {
        setProcessing(requestId);
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('content_creation_access')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.id
            })
            .eq('id', requestId);

        if (error) {
            console.error('Error approving request:', error);
            alert('Erro ao aprovar solicitação');
        } else {
            await fetchRequests();
        }

        setProcessing(null);
    }

    async function handleReject(requestId: string) {
        setProcessing(requestId);
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('content_creation_access')
            .update({
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.id
            })
            .eq('id', requestId);

        if (error) {
            console.error('Error rejecting request:', error);
            alert('Erro ao rejeitar solicitação');
        } else {
            await fetchRequests();
        }

        setProcessing(null);
    }

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            events: 'Eventos',
            jobs: 'Vagas',
            businesses: 'Negócios',
            galleries: 'Galerias',
            reels: 'Reels'
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    Pendente
                </span>
            );
        }
        if (status === 'approved') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Aprovado
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                <XCircle className="w-3 h-3" />
                Rejeitado
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-app p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                        Solicitações de Acesso
                    </h1>
                    <p className="text-secondary">
                        Gerencie as solicitações de permissão para criação de conteúdo
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                ? 'bg-[#D70F24] text-white shadow-lg'
                                : 'bg-surface text-secondary hover:bg-app'
                                }`}
                        >
                            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovadas' : 'Rejeitadas'}
                        </button>
                    ))}
                </div>

                {/* Requests Table */}
                {(loading) ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D70F24]" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-app">
                        <p className="text-secondary">Nenhuma solicitação encontrada</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block bg-surface rounded-2xl border border-app overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-app/50 border-b border-app">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">
                                            Tipo de Acesso
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">
                                            Data da Solicitação
                                        </th>
                                        {filter !== 'approved' && (
                                            <th className="px-6 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider">
                                                Ações
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-app">
                                    {(filter === 'approved' ? Object.values(requests.reduce((acc, req) => {
                                        if (!acc[req.user_id]) {
                                            acc[req.user_id] = {
                                                ...req,
                                                access_items: [{ id: req.id, type: req.access_type }]
                                            };
                                        } else {
                                            if (!acc[req.user_id].access_items) {
                                                acc[req.user_id].access_items = [{ id: acc[req.user_id].id, type: acc[req.user_id].access_type }];
                                            }
                                            acc[req.user_id].access_items!.push({ id: req.id, type: req.access_type });
                                        }
                                        return acc;
                                    }, {} as Record<string, AccessRequest & { access_items?: { id: string, type: string }[] }>)) : requests).map((request) => (
                                        <tr key={request.id} className="hover:bg-app/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#D70F24]/10 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-[#D70F24]" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-primary">
                                                            {request.profiles?.full_name || request.profiles?.username || 'Usuário'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {((request as any).access_items || [{ id: request.id, type: request.access_type }]).map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-2 group">
                                                            <span className="font-bold text-primary">
                                                                - {getTypeLabel(item.type)}
                                                            </span>
                                                            {filter === 'approved' && (
                                                                <button
                                                                    onClick={() => handleReject(item.id)}
                                                                    disabled={processing === item.id}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                                                                    title="Revogar acesso"
                                                                >
                                                                    {processing === item.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-secondary">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            {filter !== 'approved' && (
                                                <td className="px-6 py-4 text-right">
                                                    {request.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleApprove(request.id)}
                                                                disabled={processing === request.id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {processing === request.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                )}
                                                                Aprovar
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(request.id)}
                                                                disabled={processing === request.id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {processing === request.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <XCircle className="w-4 h-4" />
                                                                )}
                                                                Rejeitar
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {(filter === 'approved' ? Object.values(requests.reduce((acc, req) => {
                                if (!acc[req.user_id]) {
                                    acc[req.user_id] = {
                                        ...req,
                                        access_items: [{ id: req.id, type: req.access_type }]
                                    };
                                } else {
                                    if (!acc[req.user_id].access_items) {
                                        acc[req.user_id].access_items = [{ id: acc[req.user_id].id, type: acc[req.user_id].access_type }];
                                    }
                                    acc[req.user_id].access_items!.push({ id: req.id, type: req.access_type });
                                }
                                return acc;
                            }, {} as Record<string, AccessRequest & { access_items?: { id: string, type: string }[] }>)) : requests).map((request) => (
                                <div key={request.id} className="bg-surface rounded-2xl border border-app p-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#D70F24]/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-[#D70F24]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-primary">
                                                    {request.profiles?.full_name || request.profiles?.username || 'Usuário'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>

                                    <div className="pl-[52px]">
                                        <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                                            Tipo de Acesso
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {((request as any).access_items || [{ id: request.id, type: request.access_type }]).map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-2 justify-between">
                                                    <span className="font-bold text-primary">
                                                        - {getTypeLabel(item.type)}
                                                    </span>
                                                    {filter === 'approved' && (
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            disabled={processing === item.id}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                                                            title="Revogar acesso"
                                                        >
                                                            {processing === item.id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex gap-2 mt-2 pt-4 border-t border-app">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                disabled={processing === request.id}
                                                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                {processing === request.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                Aprovar
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                disabled={processing === request.id}
                                                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                {processing === request.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                Rejeitar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

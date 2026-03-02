"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, Clock, Plus } from 'lucide-react';

type AccessType = 'events' | 'jobs' | 'businesses' | 'galleries' | 'reels';
type AccessStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface RequestAccessButtonProps {
    accessType: AccessType;
    createPath: string;
    className?: string;
}

export default function RequestAccessButton({ accessType, createPath, className = '' }: RequestAccessButtonProps) {
    const t = useTranslations('access');
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<AccessStatus>('none');
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    async function checkAccessStatus() {
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        setUserId(user.id);

        // Check if user has a request
        const { data, error } = await supabase
            .from('content_creation_access')
            .select('status')
            .eq('user_id', user.id)
            .eq('access_type', accessType)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking access:', error);
        }

        if (data) {
            setStatus(data.status as AccessStatus);
        }

        setLoading(false);
    }

    useEffect(() => {
        checkAccessStatus();
    }, []);

    async function handleRequestAccess() {
        if (!userId) return;

        setRequesting(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('content_creation_access')
            .insert({
                user_id: userId,
                access_type: accessType,
                status: 'pending'
            });

        if (error) {
            console.error('Error requesting access:', error);
            alert(t('requestError'));
        } else {
            setStatus('pending');
        }

        setRequesting(false);
    }

    function handleCreateClick() {
        router.push(createPath);
    }

    if (loading) {
        return (
            <button disabled className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm ${className}`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('loading')}
            </button>
        );
    }

    // Not logged in
    if (!userId) {
        return (
            <button
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
                className={`inline-flex items-center gap-2 bg-[#5593C3] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 ${className}`}
            >
                {t('loginToRequest')}
            </button>
        );
    }

    // Approved - show create button
    if (status === 'approved') {
        return (
            <button
                onClick={handleCreateClick}
                className={`inline-flex items-center gap-2 bg-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 ${className}`}
            >
                <Plus className="w-5 h-5" />
                {t('create', { type: t(`types.${accessType}`) })}
            </button>
        );
    }

    // Pending - show waiting message
    if (status === 'pending') {
        return (
            <button
                disabled
                className={`inline-flex items-center gap-2 bg-amber-500/80 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed ${className}`}
            >
                <Clock className="w-5 h-5" />
                {t('pending')}
            </button>
        );
    }

    // Rejected - show message
    if (status === 'rejected') {
        return (
            <button
                disabled
                className={`inline-flex items-center gap-2 bg-red-500/80 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed ${className}`}
            >
                {t('rejected')}
            </button>
        );
    }

    // No request yet - show request button
    return (
        <button
            onClick={handleRequestAccess}
            disabled={requesting}
            className={`inline-flex items-center gap-2 bg-[#5593C3] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {requesting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('requesting')}
                </>
            ) : (
                <>
                    <CheckCircle className="w-5 h-5" />
                    {t('requestAccess', { type: t(`types.${accessType}`) })}
                </>
            )}
        </button>
    );
}

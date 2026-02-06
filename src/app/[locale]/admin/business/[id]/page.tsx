"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { businessService } from '@/lib/businessService';
import { Business } from '@/types/business';
import AdminBusinessFormClient from '../AdminBusinessFormClient';
import { Loader2 } from 'lucide-react';

export default function AdminBusinessEditPage() {
    const params = useParams();
    const id = params.id as string;
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await businessService.getBusinessById(id);
                setBusiness(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-link animate-spin" />
            </div>
        );
    }

    if (!business) {
        return <div className="p-8 text-center text-secondary">Empresa não encontrada.</div>;
    }

    return <AdminBusinessFormClient id={id} initialData={business} />;
}

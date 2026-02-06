"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { jobsService } from '@/lib/jobsService';
import { Job } from '@/types/job';
import AdminJobFormClient from '../AdminJobFormClient';
import { Loader2 } from 'lucide-react';

export default function AdminJobEditPage() {
    const params = useParams();
    const id = params.id as string;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await jobsService.getJobById(id);
                setJob(data);
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

    if (!job) {
        return <div className="p-8 text-center text-secondary">Vaga não encontrada.</div>;
    }

    return <AdminJobFormClient id={id} initialData={job} />;
}

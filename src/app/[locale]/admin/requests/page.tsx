import { Suspense } from 'react';
import AccessRequestsClient from './AccessRequestsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Solicitações de Acesso | Admin - NipponLife',
    description: 'Gerenciar solicitações de permissão para criação de conteúdo',
};

export default function AccessRequestsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D70F24]"></div>
            </div>
        }>
            <AccessRequestsClient />
        </Suspense>
    );
}

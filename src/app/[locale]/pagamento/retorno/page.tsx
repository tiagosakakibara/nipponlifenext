import { Suspense } from 'react';
import PaymentReturnClient from './ReturnClient';

export default function ReturnPage() {
    return (
        <div className="min-h-screen bg-app flex items-center justify-center p-6">
            <Suspense fallback={<div>Carregando...</div>}>
                <PaymentReturnClient />
            </Suspense>
        </div>
    );
}

'use client';

import RequestAccessButton from '@/components/access/RequestAccessButton';

export default function BusinessAccessButton() {
    return (
        <div className="pt-4 flex justify-center">
            <RequestAccessButton
                accessType="businesses"
                createPath="/admin/business/new"
            />
        </div>
    );
}

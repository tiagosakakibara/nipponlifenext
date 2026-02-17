'use client';

import RequestAccessButton from '@/components/access/RequestAccessButton';

export default function JobAccessButton() {
    return (
        <div className="pt-4 flex justify-center md:justify-start">
            <RequestAccessButton
                accessType="jobs"
                createPath="/admin/jobs/new"
            />
        </div>
    );
}

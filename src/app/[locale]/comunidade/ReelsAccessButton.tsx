'use client';

import RequestAccessButton from '@/components/access/RequestAccessButton';

export default function ReelsAccessButton() {
    return (
        <div className="flex justify-center mb-4">
            <RequestAccessButton
                accessType="reels"
                createPath="/admin/comunidade/reels"
            />
        </div>
    );
}

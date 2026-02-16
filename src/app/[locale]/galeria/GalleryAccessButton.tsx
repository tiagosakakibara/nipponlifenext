'use client';

import RequestAccessButton from '@/components/access/RequestAccessButton';

export default function GalleryAccessButton() {
    return (
        <div className="pt-4 flex justify-center">
            <RequestAccessButton
                accessType="galleries"
                createPath="/admin/gallery/new"
            />
        </div>
    );
}

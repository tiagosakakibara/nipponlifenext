'use client';

import RequestAccessButton from '@/components/access/RequestAccessButton';

export default function EventAccessButton() {
    return (
        <RequestAccessButton
            accessType="events"
            createPath="/admin/events/new"
        />
    );
}

import AdminGalleryFormClient from '@/components/admin/AdminGalleryFormClient';

interface Props {
    params: {
        id: string;
    }
}

export default async function EditAlbumPage({ params }: Props) {
    const { id } = await params;
    return <AdminGalleryFormClient albumId={id} />;
}

import AdminCommunityPostFormClient from '../AdminCommunityPostFormClient';
import { communityService } from '@/lib/communityService';
import { notFound } from 'next/navigation';

export const metadata = {
    title: 'Editar Post da Comunidade | Admin',
};

export default async function EditCommunityPostPage({ params }: { params: { id: string } }) {
    try {
        const post = await communityService.getPostById(params.id);
        if (!post) notFound();
        return <AdminCommunityPostFormClient id={params.id} initialData={post} />;
    } catch (error) {
        notFound();
    }
}

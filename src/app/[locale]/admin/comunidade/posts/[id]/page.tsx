
import AdminCommunityPostFormClient from '../AdminCommunityPostFormClient';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
    title: 'Editar Post da Comunidade | Admin',
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditCommunityPostPage(props: Props) {
    const params = await props.params;

    try {
        const supabase = await createClient();

        const { data: post, error } = await supabase
            .from('community_posts')
            .select('*, community_post_tags(tag)')
            .eq('id', params.id)
            .single();

        if (error || !post) {
            console.error('Error fetching post:', error ? JSON.stringify(error, null, 2) : 'No post found (null)');
            // If we can't find it, it might be due to RLS or it really doesn't exist
            notFound();
        }

        return <AdminCommunityPostFormClient id={params.id} initialData={post} />;
    } catch (error) {
        console.error('Error in EditCommunityPostPage catch block:', error);
        notFound();
    }
}

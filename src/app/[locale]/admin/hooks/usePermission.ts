import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from '@/i18n/routing';

export function usePermission(requiredPermission: string) {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkPermission = async () => {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'admin') {
                setIsAdmin(true);
                setHasAccess(true);
                setLoading(false);
                return;
            }

            // Check specific permission
            const { data: access } = await supabase
                .from('content_creation_access')
                .select('status')
                .eq('user_id', user.id)
                .eq('access_type', requiredPermission)
                .eq('status', 'approved')
                .single();

            if (access) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }

            setLoading(false);
        };

        checkPermission();
    }, [requiredPermission, router]);

    return { hasAccess, loading, isAdmin };
}

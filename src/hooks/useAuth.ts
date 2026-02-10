import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

// Emails that are always treated as admin regardless of the DB role value.
// Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local (comma-separated).
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function applyAdminOverride(profile: any, user: User | undefined | null): any {
    const userEmail = user?.email;
    const metadata = user?.user_metadata;
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());

    // If profile is missing or looks like an "empty" placeholder
    if (!profile) {
        const fallbackProfile = {
            role: isAdmin ? 'admin' : 'user',
            full_name: metadata?.full_name || metadata?.name || userEmail?.split('@')[0] || 'Usuário',
            username: metadata?.username || userEmail?.split('@')[0] || 'usuario',
            avatar_url: metadata?.avatar_url || metadata?.picture || null,
            status: 'active'
        };
        return fallbackProfile;
    }

    // If profile exists, ensure role is forced for admins
    if (isAdmin) {
        return { ...profile, role: 'admin' };
    }
    return profile;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, role, status, bio')
                        .eq('id', user.id)
                        .single();
                    setProfile(applyAdminOverride(data, user));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, role, status')
                    .eq('id', session.user.id)
                    .single();
                setProfile(applyAdminOverride(data, session.user));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, profile, loading };
}

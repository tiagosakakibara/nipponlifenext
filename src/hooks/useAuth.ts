import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Emails that are always treated as admin regardless of the DB role value.
// Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local (comma-separated).
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function applyAdminOverride(profile: any, userEmail: string | undefined): any {
    if (!profile || !userEmail) return profile;
    if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
        return { ...profile, role: 'admin' };
    }
    return profile;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

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
                    setProfile(applyAdminOverride(data, user.email));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, role, status, bio')
                    .eq('id', session.user.id)
                    .single();
                setProfile(applyAdminOverride(data, session.user.email));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, profile, loading };
}

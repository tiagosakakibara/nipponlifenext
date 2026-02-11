"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    role: 'user' | 'admin' | 'photographer';
    status: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    profile: AuthProfile | null;
    loading: boolean;
    isAdmin: boolean;
    isPhotographer: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function applyAdminOverride(profile: any, user: User | undefined | null): any {
    const userEmail = user?.email;
    if (!userEmail) return profile;

    const metadata = user?.user_metadata;
    const isSpecialAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());

    if (!profile) {
        return {
            id: user.id,
            role: isSpecialAdmin ? 'admin' : 'user',
            full_name: metadata?.full_name || metadata?.name || userEmail.split('@')[0] || 'Usuário',
            username: metadata?.username || userEmail.split('@')[0] || 'usuario',
            avatar_url: metadata?.avatar_url || metadata?.picture || null,
            status: 'active'
        };
    }

    if (isSpecialAdmin) {
        return { ...profile, role: 'admin' };
    }
    return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<{
        user: User | null;
        profile: AuthProfile | null;
        loading: boolean;
    }>({
        user: null,
        profile: null,
        loading: true
    });

    const getProfile = async (currentUser: User): Promise<AuthProfile> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, role, status, bio')
                .eq('id', currentUser.id)
                .single();

            return applyAdminOverride(data, currentUser);
        } catch (err) {
            console.error('Error fetching profile:', err);
            return applyAdminOverride(null, currentUser);
        }
    };

    const initializeAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;

            if (currentUser) {
                const profile = await getProfile(currentUser);
                setAuthState({ user: currentUser, profile, loading: false });
            } else {
                setAuthState({ user: null, profile: null, loading: false });
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
            setAuthState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (currentUser) {
                    const profile = await getProfile(currentUser);
                    setAuthState({ user: currentUser, profile, loading: false });
                }
            } else if (event === 'SIGNED_OUT') {
                setAuthState({ user: null, profile: null, loading: false });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user: authState.user,
        profile: authState.profile,
        loading: authState.loading,
        isAdmin: authState.profile?.role === 'admin',
        isPhotographer: authState.profile?.role === 'photographer' || authState.profile?.role === 'admin',
        refreshProfile: async () => {
            if (authState.user) {
                const profile = await getProfile(authState.user);
                setAuthState(prev => ({ ...prev, profile }));
            }
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

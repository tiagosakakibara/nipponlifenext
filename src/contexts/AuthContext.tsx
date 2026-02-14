"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
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

    // FIX 1: Ref para cancelar requisições de perfil desatualizadas.
    // Cada busca recebe um ID; se um ID mais novo chegar antes de terminar,
    // o resultado antigo é descartado.
    const fetchIdRef = useRef(0);

    // FIX 2: useCallback para estabilizar a referência de getProfile
    const getProfile = useCallback(async (currentUser: User): Promise<AuthProfile> => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, role, status, bio')
                .eq('id', currentUser.id)
                .single();
            return applyAdminOverride(data, currentUser);
        } catch (err) {
            console.error('Error fetching profile:', err);
            return applyAdminOverride(null, currentUser);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // FIX 3: Única fonte de verdade — apenas onAuthStateChange controla o estado.
        // Removemos o getSession() manual que competia com o listener e causava
        // a condição de corrida que derrubava o login ao recarregar a página.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_OUT') {
                setAuthState({ user: null, profile: null, loading: false });
                return;
            }

            // INITIAL_SESSION cobre o caso de recarregar a página com sessão ativa.
            // SIGNED_IN cobre novo login.
            // TOKEN_REFRESHED e USER_UPDATED cobrem renovação/atualização.
            if (
                event === 'INITIAL_SESSION' ||
                event === 'SIGNED_IN' ||
                event === 'TOKEN_REFRESHED' ||
                event === 'USER_UPDATED'
            ) {
                if (!currentUser) {
                    // INITIAL_SESSION sem usuário = não há sessão
                    setAuthState({ user: null, profile: null, loading: false });
                    return;
                }

                // FIX 4: Cancela resultados de buscas anteriores que ainda estão
                // em voo. Incrementa o ID antes de buscar e só aplica o resultado
                // se o ID ainda for o mais recente quando a busca terminar.
                const fetchId = ++fetchIdRef.current;
                const profile = await getProfile(currentUser);

                if (mounted && fetchId === fetchIdRef.current) {
                    setAuthState({ user: currentUser, profile, loading: false });
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [getProfile]);

    const value = {
        user: authState.user,
        profile: authState.profile,
        loading: authState.loading,
        isAdmin: authState.profile?.role === 'admin',
        isPhotographer: authState.profile?.role === 'photographer' || authState.profile?.role === 'admin',
        refreshProfile: async () => {
            if (authState.user) {
                const fetchId = ++fetchIdRef.current;
                const profile = await getProfile(authState.user);
                // Aplica só se não houve outra busca mais recente enquanto isso
                if (fetchId === fetchIdRef.current) {
                    setAuthState(prev => ({ ...prev, profile }));
                }
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

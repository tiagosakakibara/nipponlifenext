"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, LayoutDashboard, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useTranslations, useLocale } from 'next-intl';

export function UserMenu() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setIsOpen(false);
        await supabase.auth.signOut();
        // Full page reload ensures all session state (cookies, router cache,
        // in-memory auth listeners) is completely cleared before the next render.
        window.location.href = `/${locale}`;
    };

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    if (!user) {
        return (
            <button
                onClick={() => router.push('/login')}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('auth.login')}
            >
                <User className="w-5 h-5 text-secondary" />
            </button>
        );
    }

    const Avatar = () => (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#D70F24] flex items-center justify-center text-white text-xs md:text-sm font-semibold shadow-sm ring-2 ring-transparent group-hover:ring-primary/10 transition-all overflow-hidden">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
            ) : (
                <span>{profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || 'U'}</span>
            )}
        </div>
    );

    const isPhotographer = profile?.role === 'photographer' || profile?.role === 'admin';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 group transition-all"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Menu de usuário"
            >
                <Avatar />
            </button>

            {/* Unified Dropdown for Desktop and Mobile */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-3 w-72 max-w-[92vw] bg-app/95 border border-app rounded-2xl shadow-2xl z-[100] overflow-hidden animate-slide-up origin-top-right backdrop-blur-xl"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-app bg-app/50">
                        <p className="text-base font-bold text-primary truncate">
                            {profile?.full_name || 'Usuário'}
                        </p>
                        <p className="text-sm text-secondary truncate font-mono mt-0.5">
                            @{profile?.username || 'usuario'}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => handleNavigate('/perfil')}
                            className="w-full px-4 py-3 text-left text-[15px] text-secondary hover:text-primary hover:bg-app rounded-xl transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="w-4.5 h-4.5 text-muted group-hover:text-primary transition-colors" />
                                <span>{t('auth.myProfile')}</span>
                            </div>
                        </button>

                        {isPhotographer && (
                            <button
                                onClick={() => handleNavigate('/dashboard/gallery')}
                                className="w-full px-4 py-3 text-left text-[15px] text-secondary hover:text-primary hover:bg-app rounded-xl transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <Camera className="w-4.5 h-4.5 text-muted group-hover:text-primary transition-colors" />
                                    <span>Studio Fotográfico</span>
                                </div>
                            </button>
                        )}

                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => handleNavigate('/admin')}
                                className="w-full px-4 py-3 text-left text-[15px] text-secondary hover:text-primary hover:bg-app rounded-xl transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="w-4.5 h-4.5 text-muted group-hover:text-primary transition-colors" />
                                    <span>{t('admin.dashboard')}</span>
                                </div>
                            </button>
                        )}

                        <div className="h-px bg-app my-1 mx-2 opacity-50" />

                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full px-4 py-3 text-left text-[15px] text-[#D70F24] hover:bg-[#D70F24]/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-4.5 h-4.5" />
                                <span>{loggingOut ? '...' : t('auth.logout')}</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

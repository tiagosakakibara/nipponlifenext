"use client";

import { User, LogOut, Menu, Home, Sun, Moon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useEffect, useState } from 'react';

interface TopbarProps {
    onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
    const router = useRouter();
    const supabase = createClient();
    const locale = useLocale();

    const { user, profile } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = `/${locale}/admin/login`;
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    // Prevent hydration mismatch by returning a placeholder or null during server render
    // However, returning null for the entire topbar might cause layout shifts.
    // Better to just render the structure but with a default state or suppress hydration warning on specific elements.
    // But since the error is about attribute mismatch, simplest fix is to wait for mount.

    return (
        <header className="h-14 bg-surface backdrop-blur-md border-b border-app flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-secondary hover:bg-app/50 lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary tracking-tight">Admin</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--nl-accent)]/10 text-[var(--nl-accent)] font-bold uppercase hidden xs:block">Panel</span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 pr-2 md:pr-4 border-r border-app/60">
                    {/* Home Button */}
                    <button
                        onClick={() => router.push('/')}
                        title="Voltar para Home"
                        className="flex items-center justify-center p-2 rounded-lg bg-app/50 border border-app/60 text-secondary hover:text-accent hover:border-accent/30 transition-all group"
                    >
                        <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>

                    {/* Theme Toggle */}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        title={mounted && (theme === 'dark' || resolvedTheme === 'dark') ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
                        className="flex items-center justify-center p-2 rounded-lg bg-app/50 border border-app/60 text-secondary hover:text-accent hover:border-accent/30 transition-all group"
                        suppressHydrationWarning
                    >
                        {mounted && (theme === 'dark' || resolvedTheme === 'dark') ? (
                            <Sun className="w-4 h-4 transition-transform group-hover:scale-110" />
                        ) : (
                            <Moon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        )}
                    </button>

                    {/* Language Switcher */}
                    <div className="scale-90">
                        <LanguageSwitcher />
                    </div>
                </div>

                <div
                    onClick={() => router.push('/admin/profile')}
                    className="flex items-center gap-2 md:gap-3 cursor-pointer group pl-2"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-primary leading-tight hover:text-[var(--nl-accent)] transition-colors">
                            {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p className="text-[10px] text-muted font-medium uppercase tracking-tighter">Administrator</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-[var(--nl-accent)]/10 flex items-center justify-center border border-[var(--nl-accent)]/20 group-hover:bg-[var(--nl-accent)]/20 transition-all shadow-sm">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-4 h-4 text-[var(--nl-accent)]" />
                        )}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}

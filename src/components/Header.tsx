'use client';

import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}


export function Header({ searchQuery = '', onSearchChange = () => { } }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAdmin = pathname?.includes('/admin');

    if (isAdmin) return null;

    return (
        <header className="sticky top-0 z-50 bg-[var(--nl-bg)]/80 backdrop-blur-md border-b border-app transition-colors duration-300 h-[52px] flex items-center">
            <div className="max-w-[1000px] mx-auto px-4 w-full">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 lg:gap-3 flex-shrink-0 cursor-pointer"
                    >
                        <img
                            src="/images/logo.svg"
                            alt="NipponLife"
                            className="h-6 lg:h-8 w-auto"
                        />
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex flex-1 max-w-2xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nl-text-3)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-12 pr-4 py-2 bg-surface border border-[var(--nl-link)]/50 rounded-2xl text-sm text-primary placeholder:text-[var(--nl-text-3)]/70
                                hover:border-[var(--nl-link)]/70 hover:shadow-md
                                focus:outline-none focus:ring-4 focus:ring-[var(--nl-link)]/15 focus:border-[var(--nl-link)]/70
                                transition-all duration-300"
                            />
                        </div>
                    </div>




                    {/* Actions */}
                    <div className="flex items-center gap-0.5 sm:gap-2">
                        <button
                            onClick={() => setTheme(theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark')}
                            className="p-1.5 sm:p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Toggle theme"
                            suppressHydrationWarning
                        >
                            {mounted && (theme === 'dark' || resolvedTheme === 'dark') ? (
                                <Sun className="w-5 h-5 text-zinc-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-zinc-400" />
                            )}
                        </button>

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* User Menu */}
                        <UserMenu />

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-zinc-400" />
                            ) : (
                                <Menu className="w-5 h-5 text-zinc-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="absolute top-[52px] left-0 w-full bg-white dark:bg-[#1a1a1a] border-b border-zinc-100 dark:border-zinc-800 shadow-2xl p-6 lg:hidden animate-slide-up">
                        <ul className="flex flex-col gap-3">

                            <li className="pt-2">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        router.push(user ? '/perfil' : `/login?redirect=${encodeURIComponent(pathname)}`);
                                    }}
                                    className="block w-full text-center px-5 py-4 rounded-2xl bg-[#1a1a1a] text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    {user ? t('auth.myAccount') : t('auth.login')}
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
}

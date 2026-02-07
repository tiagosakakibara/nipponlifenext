'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { Globe, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'pt', label: 'Português' },
        { code: 'ja', label: '日本語' },
        { code: 'en', label: 'English' }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1.5 ${isOpen ? 'bg-surface ring-1 ring-app shadow-sm' : 'hover:bg-surface'}`}
                aria-label="Mudar idioma"
                aria-expanded={isOpen}
            >
                <Globe className={`w-4 h-4 transition-colors ${isOpen ? 'text-accent' : 'text-secondary'}`} />
                <span className="text-[10px] font-black uppercase text-secondary tracking-wider">{locale}</span>
                <ChevronDown className={`w-3 h-3 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-app/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-app py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-1 mb-1 border-b border-app/50">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Idioma</span>
                    </div>
                    {languages.map((lang) => (
                        <Link
                            key={lang.code}
                            href={{
                                pathname: pathname,
                                query: Object.fromEntries(searchParams.entries())
                            }}
                            locale={lang.code}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-surface ${locale === lang.code
                                ? 'text-accent font-bold bg-accent/5'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            <span>{lang.label}</span>
                            {locale === lang.code && (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(215,15,36,0.5)]" />
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

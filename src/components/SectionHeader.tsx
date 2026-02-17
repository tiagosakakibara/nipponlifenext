'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    viewAllPath?: string;
    titleLink?: string;
    className?: string;
}

export function SectionHeader({ title, icon, viewAllPath, titleLink, className = '' }: SectionHeaderProps) {
    const router = useRouter();
    const t = useTranslations();

    const handleTitleClick = () => {
        if (titleLink) {
            router.push(titleLink);
        }
    };

    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div
                className={`flex items-center gap-3 ${titleLink ? 'cursor-pointer group' : ''}`}
                onClick={handleTitleClick}
            >
                {icon && (
                    <div className={`w-10 h-10 rounded-xl bg-surface border border-app flex items-center justify-center text-accent shadow-sm ${titleLink ? 'group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300' : ''}`}>
                        {icon}
                    </div>
                )}
                <h2 className={`section-title mb-0 ${titleLink ? 'group-hover:text-accent transition-colors' : ''}`}>
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {viewAllPath && (
                    <button
                        onClick={() => router.push(viewAllPath)}
                        className="hidden md:flex items-center gap-2 text-accent hover:text-accent-dark font-bold text-sm uppercase tracking-wider group transition-colors"
                    >
                        {t('common.viewAll')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
}

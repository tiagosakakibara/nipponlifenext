'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

export function Footer() {
    const t = useTranslations();
    const pathname = usePathname();

    const isAdmin = pathname?.includes('/admin');

    if (isAdmin) return null;

    return (
        <footer className="border-t border-app mt-12 bg-surface transition-colors duration-300">
            <div className="max-w-[1000px] mx-auto px-4 py-8">
                {/* Linha inferior */}
                <div className="text-center">
                    <p className="text-muted text-xs mb-3">
                        © 2026 NipponLife. {t('footer.allRightsReserved')}.
                    </p>

                    <div className="flex justify-center gap-6">
                        <Link href="/privacidade" className="text-muted hover:text-primary text-xs transition-colors">
                            {t('footer.privacy')}
                        </Link>
                        <Link href="/termos" className="text-muted hover:text-primary text-xs transition-colors">
                            {t('footer.terms')}
                        </Link>
                        <Link href="/sobre" className="text-muted hover:text-primary text-xs transition-colors">
                            {t('footer.about')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

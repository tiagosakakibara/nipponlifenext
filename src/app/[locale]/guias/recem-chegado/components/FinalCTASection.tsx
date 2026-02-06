'use client';

import { ArrowRight, Info } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface FinalCTASectionProps {
    locale: string;
}

export default function FinalCTASection({ locale }: FinalCTASectionProps) {
    const t = useTranslations();

    return (
        <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[#003768] rounded-2xl overflow-hidden">
                    <div className="px-6 py-12 md:px-12 md:py-16 text-center">
                        {/* Title */}
                        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                            {t('guides.cta.title')}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
                            {t('guides.cta.description')}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {/* Primary Button */}
                            <Link
                                href="/comunidade/duvidas"
                                className="w-full sm:w-auto bg-[#D70F24] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#D70F2466] hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 group"
                            >
                                {t('guides.cta.primary')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Secondary Button (Outline) */}
                            <Link
                                href="/sobre"
                                className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/50 inline-flex items-center justify-center gap-2"
                            >
                                <Info className="w-4 h-4" />
                                {t('guides.cta.secondary')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

import { useTranslations } from 'next-intl';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import airplaneAnimation from '@/assets/lottie/airplane.json';
import { useMemo, useRef, useEffect } from 'react';

interface TourismVisualCardProps {
    year?: string | number;
}

export function TourismVisualCard({ year }: TourismVisualCardProps) {
    const t = useTranslations();
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Check for reduced motion preference
    const prefersReducedMotion = useMemo(() => {
        return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Set animation speed on mount
    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(0.7);
        }
    }, [lottieRef.current]);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col justify-center relative overflow-hidden min-h-[400px]">
            {/* Layer B: Animation Layer (Background) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.14] dark:opacity-[0.10] mix-blend-multiply dark:mix-blend-soft-light overflow-hidden">
                <Lottie
                    lottieRef={lottieRef}
                    animationData={airplaneAnimation}
                    loop={!prefersReducedMotion}
                    autoplay={!prefersReducedMotion}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="w-full h-full"
                />
            </div>

            {/* Layer C: Content Layer (Foreground) */}
            <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/20 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wider mb-6 border border-blue-100 dark:border-blue-900/30 backdrop-blur-sm shadow-sm">
                    {year || '2023-2024'}
                </div>

                <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
                    {t('statistics.tourism.title')}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                    {t('statistics.tourism.description')}
                </p>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t('statistics.tourism.source_label')}:
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {t('statistics.tourism.source_value')}
                    </span>
                </div>
            </div>
        </div>
    );
}

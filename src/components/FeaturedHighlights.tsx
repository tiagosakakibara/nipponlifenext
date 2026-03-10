'use client';

import { useState, useEffect } from 'react';
import { LargeFeaturedCard } from './LargeFeaturedCard';
import { SmallFeaturedCard } from './SmallFeaturedCard';
import { FeaturedItem } from './LargeFeaturedCard';

interface FeaturedHighlightsProps {
    premiumBusiness: FeaturedItem | null;
    headerJobs: FeaturedItem[];
}

export function FeaturedHighlights({ premiumBusiness, headerJobs }: FeaturedHighlightsProps) {
    const [jobsIndex, setJobsIndex] = useState(0);

    // Automatic rotation for header jobs (small cards)
    useEffect(() => {
        if (headerJobs.length <= 3) return;

        const interval = setInterval(() => {
            setJobsIndex((prevIndex) => (prevIndex + 1) % headerJobs.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [headerJobs.length]);

    if (!premiumBusiness && headerJobs.length === 0) {
        return (
            <div className="py-12 text-center text-[var(--nl-secondary)] mb-6">
                Nenhum destaque disponível no momento
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Large Featured Card - Premium Business Only */}
            {premiumBusiness && (
                <LargeFeaturedCard item={premiumBusiness} />
            )}

            {/* Small Cards - Jobs with Rotation */}
            {headerJobs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-[25px]">
                    {/* We concat the array to itself to handle smooth infinite-like feeling if needed, 
                        or just slice it. The original code sliced from 'jobsIndex'.
                        Wait, slicing from jobsIndex to jobsIndex+3 on a rotated array is tricky if we don't wrap around.
                        The original code did: [...headerJobs, ...headerJobs].slice(jobsIndex, jobsIndex + 3)
                        This handles the wrap-around perfectly.
                    */}
                    {[...headerJobs, ...headerJobs]
                        .slice(jobsIndex, jobsIndex + 3)
                        .map((item, index) => (
                            <SmallFeaturedCard
                                key={`${item.id}-${index}`}
                                item={item}
                                // Hide the 3rd item on medium screens if desired, but default grid is 1 -> 3 cols.
                                // Original code had: className={index === 2 ? 'hidden md:block' : ''}
                                // This means on mobile (1 col), it shows all 3? No, grid-cols-1.
                                // Wait, usually carousel is horizontal or stacked.
                                // If grid-cols-1, they stack vertically.
                                // If we want to hide specifically, verify logic.
                                // Original logic: index === 2 ? 'hidden md:block' : '' 
                                // This implies showing only 2 items on mobile? 
                                // Actually, grid-cols-1 shows all 3 stacked.
                                // Maybe the original design intended 2 items on mobile?
                                // Let's keep it simple for now or strictly follow original.
                                className={index === 2 ? 'hidden md:block' : ''}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

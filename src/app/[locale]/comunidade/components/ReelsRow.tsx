'use client';

import { useState, useRef } from 'react';
import { Play, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { CommunityReel } from '@/lib/reelsService';
import { ReelModal } from './ReelModal';

interface ReelsRowProps {
    reels: CommunityReel[];
}

export function ReelsRow({ reels }: ReelsRowProps) {
    const [selectedReel, setSelectedReel] = useState<CommunityReel | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!reels || reels.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <Link href="/reels" className="group">
                    <h2 className="text-lg font-bold text-primary font-['Montserrat'] flex items-center gap-2 group-hover:text-[var(--nl-accent)] transition-colors">
                        <Film className="w-5 h-5" />
                        Reels
                    </h2>
                </Link>
            </div>

            <div className="relative group/scroll">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-40 p-2 bg-surface/80 hover:bg-surface text-primary rounded-full shadow-lg border border-app opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {reels.map((reel) => (
                        <button
                            key={reel.id}
                            onClick={() => setSelectedReel(reel)}
                            className="relative flex-shrink-0 w-[112px] h-[200px] rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover-lift shadow-sm transition-all duration-300"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            {/* Background Overlay - Top and Bottom Gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-300 z-10" />

                            {/* Hover Border Overlay */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-2xl transition-all duration-300 z-30 pointer-events-none" />

                            {/* Thumbnail */}
                            {reel.thumbnail_url ? (
                                <img
                                    src={reel.thumbnail_url}
                                    alt={reel.title || 'Reel'}
                                    className={`absolute inset-0 w-full h-full object-cover text-transparent transition-transform duration-700 ${reel.provider === 'youtube' ? 'scale-[1.35] group-hover:scale-[1.5]' : 'group-hover:scale-110'}`}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-surface flex items-center justify-center">
                                    <Film className="w-10 h-10 text-muted/30" />
                                </div>
                            )}

                            {/* Play icon for YouTube */}
                            {reel.provider === 'youtube' && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-90 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-12 h-12 bg-[var(--nl-accent)]/90 rounded-full flex items-center justify-center shadow-xl border border-white/20 group-hover:scale-110 transition-transform">
                                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                    </div>
                                </div>
                            )}

                            {/* Title Overlay */}
                            {reel.title && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                                    <span className="text-white text-sm font-bold font-display drop-shadow-lg line-clamp-2 leading-tight group-hover:text-[var(--nl-accent)] transition-colors">
                                        {reel.title}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-40 p-2 bg-surface/80 hover:bg-surface text-primary rounded-full shadow-lg border border-app opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Modal */}
            {selectedReel && (
                <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
            )}
        </>
    );
}

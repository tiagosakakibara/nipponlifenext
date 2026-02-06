'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Film } from 'lucide-react';
import { fetchActiveReels, CommunityReel } from '@/lib/reelsService';
import { ReelModal } from './ReelModal';

export function ReelsRow() {
    const [reels, setReels] = useState<CommunityReel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReel, setSelectedReel] = useState<CommunityReel | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadReels = async () => {
            const data = await fetchActiveReels(5);
            setReels(data);
            setLoading(false);
        };
        loadReels();
    }, []);

    if (loading) {
        return (
            <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-visible pb-2 scrollbar-hide mb-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="shrink-0 lg:shrink w-[180px] lg:w-full h-[320px] rounded-2xl bg-[var(--nl-surface)]/50 animate-pulse border border-[var(--nl-border)]" />
                ))}
            </div>
        );
    }

    if (reels.length === 0) {
        return null;
    }

    return (
        <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--nl-primary)] font-display flex items-center gap-2">
                    <Film className="w-5 h-5 text-[var(--nl-accent)]" />
                    Reels
                </h2>
            </div>

            <div
                ref={scrollRef}
                className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-visible pb-4 scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {reels.map((reel) => (
                    <button
                        key={reel.id}
                        onClick={() => setSelectedReel(reel)}
                        className="relative shrink-0 lg:shrink w-[180px] lg:w-full h-[320px] rounded-2xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--nl-accent)] focus:ring-offset-2 hover-lift shadow-lg transition-all duration-500"
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
                            <div className="absolute inset-0 bg-[var(--nl-surface)] flex items-center justify-center">
                                <Film className="w-10 h-10 text-[var(--nl-muted)]/30" />
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
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-left">
                                <span className="text-white text-sm font-bold font-display drop-shadow-lg line-clamp-2 leading-tight group-hover:text-[var(--nl-accent)] transition-colors">
                                    {reel.title}
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Modal */}
            {selectedReel && (
                <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
            )}
        </section>
    );
}

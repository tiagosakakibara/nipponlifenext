'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { CommunityReel } from '@/lib/reelsService';

interface ReelModalProps {
    reel: CommunityReel;
    onClose: () => void;
}

export function ReelModal({ reel, onClose }: ReelModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Handle ESC key and focus management
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Focus close button on mount
        closeButtonRef.current?.focus();

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label={reel.title || 'Reel'}
        >
            {/* Close button */}
            <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Fechar"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* Content */}
            <div className="relative w-full max-w-4xl mx-4 animate-zoom-in">
                {reel.provider === 'youtube' && reel.youtube_video_id ? (
                    // YouTube embed
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${reel.youtube_video_id}?autoplay=1&rel=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={reel.title || 'YouTube Video'}
                        />
                    </div>
                ) : reel.provider === 'image' && reel.thumbnail_url ? (
                    // Image lightbox
                    <div className="flex flex-col items-center">
                        <img
                            src={reel.thumbnail_url}
                            alt={reel.title || 'Imagem'}
                            className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
                        />
                        {reel.title && (
                            <p className="mt-4 text-white text-lg font-medium">{reel.title}</p>
                        )}
                    </div>
                ) : (
                    // Fallback
                    <div className="bg-gray-900 rounded-xl p-8 text-center">
                        <p className="text-white">Conteúdo não disponível</p>
                    </div>
                )}
            </div>
        </div>
    );
}

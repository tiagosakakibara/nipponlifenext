'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { storageService } from '@/lib/storageService';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface BusinessGalleryProps {
    images: string[];
    title?: string;
    videoUrl?: string | null;
}

function getEmbedUrl(url: string): string | null {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
}

export function BusinessGallery({ images, title, videoUrl }: BusinessGalleryProps) {
    const t = useTranslations();
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px) to register a swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

    const handleNextImage = useCallback(() => {
        if (selectedImageIndex === null || !images) return;
        setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }, [selectedImageIndex, images]);

    const handlePrevImage = useCallback(() => {
        if (selectedImageIndex === null || !images) return;
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }, [selectedImageIndex, images]);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            handleNextImage();
        } else if (isRightSwipe) {
            handlePrevImage();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'Escape') setSelectedImageIndex(null);
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'ArrowLeft') handlePrevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, handleNextImage, handlePrevImage]);

    if ((!images || images.length === 0) && !embedUrl) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 font-display text-primary">{t('business.gallery', { defaultMessage: 'Galeria' })}</h2>

            {embedUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden aspect-video shadow-sm border border-app bg-black">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={title ? `${title} Video` : 'Video'}
                    />
                </div>
            )}

            {images && images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-app group focus:outline-none focus:ring-2 focus:ring-sakura relative"
                        >
                            <img
                                src={storageService.getFileUrl(img)}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={`${title || 'Gallery'} ${idx + 1}`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {selectedImageIndex !== null && images && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setSelectedImageIndex(null)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button
                        className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(null); }}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors z-50 md:left-10"
                                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <button
                                className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors z-50 md:right-10"
                                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </>
                    )}

                    <div
                        className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={storageService.getFileUrl(images[selectedImageIndex])}
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-zoom-in"
                            alt={`Gallery image ${selectedImageIndex + 1}`}
                        />
                        <div className="mt-6 flex gap-2">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === selectedImageIndex ? 'w-8 bg-sakura' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

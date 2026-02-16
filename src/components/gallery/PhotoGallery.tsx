'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import { GalleryPhoto } from '@/types/gallery';

interface PhotoGalleryProps {
    photos: GalleryPhoto[];
    galleryId?: string;
}

export function PhotoGallery({ photos, galleryId = 'main-gallery' }: PhotoGalleryProps) {
    const t = useTranslations();
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

    useEffect(() => {
        if (!photos || photos.length === 0) return;

        if (lightboxRef.current) {
            lightboxRef.current.destroy();
        }

        const isMobile = window.innerWidth < 768;

        const lightbox = new PhotoSwipeLightbox({
            gallery: '#' + galleryId,
            children: 'a.pswp-link',
            pswpModule: () => import('photoswipe'),
            showHideAnimationType: 'zoom',
            bgOpacity: 0.95,
            padding: isMobile
                ? { top: 10, bottom: 10, left: 5, right: 5 }
                : { top: 40, bottom: 40, left: 40, right: 40 },

            initialZoomLevel: 'fit',
            secondaryZoomLevel: isMobile ? 1.2 : 1.5,
            maxZoomLevel: isMobile ? 2 : 3,

            imageClickAction: 'zoom',
            doubleTapAction: 'zoom',
        });

        // Override image loading to always detect real dimensions
        // Critical for iOS Safari where wrong dimensions cause overflow
        lightbox.on('contentLoad', (e: any) => {
            const { content } = e;

            if (content.type === 'image') {
                e.preventDefault();
                content.state = 'loading';

                const img = document.createElement('img');
                img.className = 'pswp__img';

                img.onload = () => {
                    content.width = img.naturalWidth;
                    content.height = img.naturalHeight;
                    content.element = img;
                    content.onLoaded();

                    // Force PhotoSwipe to recalculate zoom with correct dimensions
                    // This is critical for iOS Safari
                    if (content.slide) {
                        try {
                            content.slide.updateContentSize(true);
                        } catch (_) {
                            // Fallback: try to trigger a resize
                            try {
                                content.slide.resize();
                            } catch (_) { /* silent */ }
                        }
                    }
                };

                img.onerror = () => content.onError();
                img.src = content.data.src;
            }
        });

        // Force recalculation on resize (iOS Safari address bar changes viewport)
        lightbox.on('openingAnimationEnd', () => {
            if (lightbox.pswp) {
                const pswp = lightbox.pswp;
                const handleResize = () => pswp.updateSize(true);
                window.addEventListener('resize', handleResize);
                pswp.on('close', () => {
                    window.removeEventListener('resize', handleResize);
                });
            }
        });

        lightbox.init();
        lightboxRef.current = lightbox;

        return () => {
            if (lightboxRef.current) {
                lightboxRef.current.destroy();
                lightboxRef.current = null;
            }
        };
    }, [galleryId, photos]);

    if (!photos || photos.length === 0) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-muted font-sans tracking-wider uppercase text-sm">
                <span>{t('gallery.noPhotos')}</span>
            </div>
        );
    }

    return (
        <div id={galleryId} className="pswp-gallery w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 p-4 md:p-8">
            {photos.map((photo) => (
                <a
                    key={photo.id}
                    href={photo.image_url}
                    data-pswp-width={photo.width && photo.width > 0 ? photo.width : 1600}
                    data-pswp-height={photo.height && photo.height > 0 ? photo.height : 1200}
                    target="_blank"
                    rel="noreferrer"
                    className="pswp-link block no-underline group relative"
                >
                    <div className="aspect-square w-full overflow-hidden bg-surface-dark border border-app hover-lift transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-black/20 rounded-lg">
                        <img
                            src={photo.image_url}
                            alt={photo.title || 'Exhibition photo'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /><path d="M11 8v6" /></svg>
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}

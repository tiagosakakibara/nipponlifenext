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

        // Cleanup previous instance if any
        if (lightboxRef.current) {
            lightboxRef.current.destroy();
        }

        const lightbox = new PhotoSwipeLightbox({
            gallery: '#' + galleryId,
            children: 'a.pswp-link',
            pswpModule: () => import('photoswipe'),
            showHideAnimationType: 'zoom',
            bgOpacity: 0.9,
            padding: { top: 30, bottom: 30, left: 20, right: 20 },

            // Helpful to ensure the correct item is picked up
            initialZoomLevel: 'fit',
            secondaryZoomLevel: 1.5,
            maxZoomLevel: 2,

            imageClickAction: 'zoom',
            doubleTapAction: 'zoom',
            thumbSelector: 'img',
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
        <div id={galleryId} className="pswp-gallery w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:p-8">
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
                    <div className="aspect-[4/3] w-full overflow-hidden bg-surface-dark border border-app hover-lift transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-black/20">
                        <img
                            src={photo.image_url}
                            alt={photo.title || 'Exhibition photo'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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

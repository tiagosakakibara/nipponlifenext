'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Camera, Calendar, Image, Eye, User } from 'lucide-react';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { GalleryAlbumWithStats } from '@/types/gallery';
import { supabase } from '@/lib/supabaseClient';
import { useTranslations, useLocale } from 'next-intl';

interface GalleryAlbumCardProps {
    album: GalleryAlbumWithStats;
    isGrid?: boolean;
}

export function GalleryAlbumCard({ album, isGrid }: GalleryAlbumCardProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [images, setImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Helper function to get translated field
    const getTranslatedField = (fieldName: 'title' | 'description'): string => {
        if (locale === 'ja' && album[`${fieldName}_ja` as keyof GalleryAlbumWithStats]) {
            return album[`${fieldName}_ja` as keyof GalleryAlbumWithStats] as string;
        }
        if (locale === 'en' && album[`${fieldName}_en` as keyof GalleryAlbumWithStats]) {
            return album[`${fieldName}_en` as keyof GalleryAlbumWithStats] as string;
        }
        // Default to Portuguese
        return album[fieldName] as string;
    };

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch cover photo if exists
                let coverUrl: string | null = null;
                if (album.cover_photo_id) {
                    const { data } = await supabase
                        .from('gallery_photos')
                        .select('image_url')
                        .eq('id', album.cover_photo_id)
                        .single();
                    if (data?.image_url) {
                        coverUrl = data.image_url;
                    }
                }

                // Fetch 3 most recent photos from the album
                const { data: recentPhotos } = await supabase
                    .from('gallery_photos')
                    .select('image_url')
                    .eq('album_id', album.id)
                    .order('created_at', { ascending: false })
                    .limit(3);

                // Combine unique images, prioritizing cover
                const photoUrls = new Set<string>();
                // Add placeholder if nothing else, but we usually have photos
                if (coverUrl) photoUrls.add(coverUrl);

                recentPhotos?.forEach(photo => {
                    if (photo.image_url) photoUrls.add(photo.image_url);
                });

                if (photoUrls.size === 0) {
                    photoUrls.add('/images/placeholder-gallery.jpg');
                }

                setImages(Array.from(photoUrls).slice(0, 3));
            } catch (error) {
                console.error('Error fetching album images:', error);
                setImages(['/images/placeholder-gallery.jpg']);
            }
        };

        fetchImages();
    }, [album.id, album.cover_photo_id]);

    // Slideshow effect
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    // Format date
    const eventDate = album.event_date
        ? new Date(album.event_date).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        : null;

    return (
        <Link
            href={`/galeria/album/${album.id}`}
            className={`${isGrid ? 'w-full' : 'carousel-item w-[280px] md:w-[301px]'} group cursor-pointer block`}
        >
            <div className="relative h-[350px] w-full rounded-2xl overflow-hidden hover-lift shadow-lg hover:shadow-accent/20 transition-all duration-500 border border-app">
                {/* Background Images with Slideshow Effect */}
                <div className="absolute inset-0 overflow-hidden bg-neutral-900">
                    {images.map((img, index) => (
                        <div
                            key={img}
                            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <ResponsiveImage
                                src={img}
                                alt={getTranslatedField('title')}
                                className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-110"
                            />
                        </div>
                    ))}

                    {/* Fallback/Loading state */}
                    {images.length === 0 && (
                        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                    )}
                </div>

                {/* Gradient Overlay - Much smoother and darker at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/40 to-black/0 z-20" />

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[9px] font-bold border border-white/10 uppercase tracking-widest">
                        <Image className="w-3 h-3" />
                        {t('gallery.tag')}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-accent/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/20 transform -translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                        <Camera className="w-4 h-4" />
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end z-30">
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors duration-300">
                        {getTranslatedField('title')}
                    </h3>

                    {/* Description */}
                    {getTranslatedField('description') && (
                        <p className="text-white/80 text-xs mb-4 line-clamp-2 leading-relaxed">
                            {getTranslatedField('description')}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-col gap-2 border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Photo Count */}
                                <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-medium uppercase tracking-wider">
                                    <Image className="w-3 h-3 text-accent" />
                                    <span>{album.photo_count || 0} {t('gallery.photos')}</span>
                                </div>

                                {/* View Count */}
                                <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-medium uppercase tracking-wider">
                                    <Eye className="w-3 h-3 text-accent" />
                                    <span>{album.view_count || 0}</span>
                                </div>
                            </div>

                            {/* View Arrow */}
                            <div className="text-[10px] font-bold text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                                {t('common.viewDetails')} &rarr;
                            </div>
                        </div>

                        {/* Event Date (Lower row) */}
                        {eventDate && (
                            <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-bold uppercase tracking-[0.1em]">
                                <Calendar className="w-3 h-3" />
                                <span>{eventDate}</span>
                            </div>
                        )}

                        {/* Creator Info */}
                        {(album.custom_author_name || album.creator_name || album.creator_username) && (
                            <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-medium uppercase tracking-[0.1em]">
                                <User className="w-3 h-3" />
                                <span>{album.custom_author_name || album.creator_name || album.creator_username}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Animated Inner Border on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-2xl transition-all duration-300 pointer-events-none z-30" />
            </div>
        </Link>
    );
}

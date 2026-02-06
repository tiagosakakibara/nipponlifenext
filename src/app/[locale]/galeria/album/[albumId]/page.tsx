'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';
import { galleryService } from '@/lib/galleryService';
import { GalleryPhoto, GalleryAlbumWithStats } from '@/types/gallery';
import { Loader2, ArrowLeft, Calendar, Eye, Camera, User } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AlbumViewPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();
    const albumId = params.albumId as string;

    const [album, setAlbum] = useState<GalleryAlbumWithStats | null>(null);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to get translated field
    const getTranslatedField = (fieldName: 'title' | 'description'): string => {
        if (!album) return '';

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
        const loadAlbumData = async () => {
            if (!albumId) return;

            try {
                // Load album details
                const albumData = await galleryService.getAlbum(albumId);

                // Check visibility permissions - for now, only show published albums
                if (albumData.status !== 'published') {
                    console.log('Access denied: Album is not public');
                    setAlbum(null);
                    setLoading(false);
                    return;
                }

                setAlbum(albumData);

                // Increment views (non-blocking) - only if published
                if (albumData.status === 'published') {
                    galleryService.incrementAlbumViews(albumId);
                }

                // Load album photos
                const photosData = await galleryService.getPhotos(100, albumId);
                setPhotos(photosData);
            } catch (error) {
                console.error("Failed to load album:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAlbumData();
    }, [albumId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-app">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Loading exhibition...</p>
                </div>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-app">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">Album not found</h2>
                    <Link
                        href="/galeria"
                        className="px-6 py-3 bg-accent text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-all inline-block"
                    >
                        Back to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    const eventDate = album.event_date
        ? new Date(album.event_date).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
        : null;

    return (
        <main className="min-h-screen bg-app transition-colors duration-300">
            {/* Back Button */}
            <div className="max-w-[1600px] mx-auto px-6 pt-8 relative z-50">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push('/galeria');
                    }}
                    className="group flex items-center gap-2 text-muted hover:text-primary transition-colors inline-flex"
                >
                    <div className="w-8 h-8 rounded-full border border-app flex items-center justify-center group-hover:border-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('gallery.back')}</span>
                </button>
            </div>

            {/* Album Header */}
            <div className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Link href="/galeria" className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.2em] shadow-sm border border-accent/5 hover:bg-accent/20 transition-all cursor-pointer">
                        <Camera className="w-4 h-4 animate-pulse" />
                        {t('gallery.albumHeader')}
                    </Link>
                </div>

                <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary mb-6 tracking-tight leading-tight">
                    {getTranslatedField('title')}
                </h1>

                {getTranslatedField('description') && (
                    <p className="text-base md:text-lg text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
                        {getTranslatedField('description')}
                    </p>
                )}

                {/* Album Meta */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted">
                    {eventDate && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{eventDate}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>{photos.length} {photos.length === 1 ? t('gallery.photo') : t('gallery.photos')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{album.view_count || 0} {t('gallery.views')}</span>
                    </div>
                </div>

                {/* Creator Info */}
                <div className="mt-6 pt-6 border-t border-app/50">
                    <div className="flex items-center justify-center gap-3">
                        {album.creator_avatar ? (
                            <img
                                src={album.creator_avatar}
                                alt={album.creator_name || album.creator_username || 'Creator'}
                                className="w-10 h-10 rounded-full border-2 border-accent/20 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-accent" />
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-wider text-muted font-bold">
                                {t('gallery.photographer')}
                            </p>
                            <p className="text-sm font-medium text-primary">
                                {album.custom_author_name || album.creator_name || album.creator_username || 'NipponLife Member'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="max-w-[1600px] mx-auto pb-32 px-4">
                {photos.length === 0 ? (
                    <div className="text-center py-20">
                        <Camera className="w-16 h-16 text-muted mx-auto mb-4" />
                        <p className="text-muted">No photos in this album yet.</p>
                    </div>
                ) : (
                    <PhotoGallery
                        photos={photos}
                        galleryId={`album-${albumId}`}
                    />
                )}
            </div>
        </main>
    );
}

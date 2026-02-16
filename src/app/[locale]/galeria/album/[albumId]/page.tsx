'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { galleryService } from '@/lib/galleryService';
import { GalleryPhoto, GalleryAlbumWithStats } from '@/types/gallery';
import { Loader2, ArrowLeft, Calendar, Eye, Camera, User, Share2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabaseClient';
import { storageService } from '@/lib/storageService';
import { ResponsiveImage } from '@/components/ResponsiveImage';

const PhotoGallery = dynamic(() => import('@/components/gallery/PhotoGallery').then(mod => ({ default: mod.PhotoGallery })), {
    loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-link" /></div>,
    ssr: false
});

export default function AlbumViewPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();
    const albumId = params.albumId as string;

    const [album, setAlbum] = useState<GalleryAlbumWithStats | null>(null);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);

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

                // Fetch Cover Image
                if (albumData.cover_photo_id) {
                    const { data } = await supabase
                        .from('gallery_photos')
                        .select('image_url')
                        .eq('id', albumData.cover_photo_id)
                        .single();
                    if (data?.image_url) {
                        setCoverUrl(storageService.getFileUrl(data.image_url));
                    }
                }

                // Increment views (non-blocking) - only if published
                if (albumData.status === 'published') {
                    galleryService.incrementAlbumViews(albumId);
                }

                // Load album photos
                const photosData = await galleryService.getPhotos(100, albumId);
                setPhotos(photosData);

                // Fallback cover if no specific cover but has photos
                if (!albumData.cover_photo_id && photosData.length > 0) {
                    setCoverUrl(storageService.getFileUrl(photosData[0].image_url));
                }

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
            {/* Hero Section */}
            <div className="pt-4 pb-4 md:pt-12 md:pb-12 px-4 md:px-6 text-center max-w-5xl mx-auto flex flex-col items-center relative z-20">
                {/* Back Button */}
                <div className="absolute top-0 left-0 md:left-4 z-50">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push('/galeria');
                        }}
                        className="group flex items-center gap-3 text-muted hover:text-primary transition-colors p-2"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface border border-app flex items-center justify-center group-hover:bg-app transition-all shadow-sm">
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] hidden md:block">{t('gallery.back')}</span>
                    </button>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-accent/10 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/20 mb-2 md:mb-6 shadow-sm mt-10 md:mt-0">
                    <Camera className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {t('gallery.albumHeader')}
                </div>

                <h1 className="font-serif text-2xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 md:mb-6 tracking-tight leading-tight">
                    {getTranslatedField('title')}
                </h1>

                {getTranslatedField('description') && (
                    <p className="text-sm md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-3 md:mb-6 font-light line-clamp-2 md:line-clamp-none">
                        {getTranslatedField('description')}
                    </p>
                )}

                {/* Album Meta */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-y-3 gap-x-8 md:gap-20 mb-2 md:mb-12 w-full md:w-auto">
                    {eventDate && (
                        <>
                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted/70">{t('common.date', { defaultMessage: 'Data' })}</span>
                                <div className="flex items-center gap-2 md:gap-3 text-primary">
                                    <Calendar className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                                    <span className="text-sm md:text-lg font-medium">{eventDate}</span>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-muted/20 hidden md:block" />
                        </>
                    )}

                    <div className="flex flex-col items-center gap-1 md:gap-2">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted/70">{t('gallery.photos')}</span>
                        <div className="flex items-center gap-2 md:gap-3 text-primary">
                            <Camera className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                            <span className="text-sm md:text-lg font-medium">{photos.length}</span>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-muted/20 hidden md:block" />

                    <div className="flex flex-col items-center gap-1 md:gap-2">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted/70">{t('gallery.views')}</span>
                        <div className="flex items-center gap-2 md:gap-3 text-primary">
                            <Eye className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                            <span className="text-sm md:text-lg font-medium">{album.view_count || 0}</span>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-muted/20 hidden md:block" />

                    <div className="flex flex-col items-center gap-1 md:gap-2 col-span-2 md:col-span-auto">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted/70">
                            {t('gallery.photographer')}
                        </span>
                        <div className="flex items-center gap-2 md:gap-3 text-primary">
                            {album.creator_avatar ? (
                                <img
                                    src={album.creator_avatar}
                                    alt={album.creator_name || album.creator_username || 'Creator'}
                                    className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover border border-accent/50 shadow-sm"
                                />
                            ) : (
                                <User className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                            )}
                            <span className="text-sm md:text-lg font-medium">
                                {album.custom_author_name || album.creator_name || album.creator_username || 'NipponLife Member'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="max-w-[1800px] mx-auto pb-32 px-4 md:px-8 relative z-30">
                {photos.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-app shadow-xl">
                        <Camera className="w-16 h-16 text-muted mx-auto mb-4" />
                        <p className="text-muted text-lg">No photos in this album yet.</p>
                    </div>
                ) : (
                    <div className="bg-surface/50 backdrop-blur-sm rounded-3xl p-4 md:p-8 border border-white/5 shadow-2xl">
                        <PhotoGallery
                            photos={photos}
                            galleryId={`album-${albumId}`}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}

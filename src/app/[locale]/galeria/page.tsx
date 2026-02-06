'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { galleryService } from '@/lib/galleryService';
import { GalleryAlbumWithStats } from '@/types/gallery';
import { Camera } from 'lucide-react';
import { GalleryAlbumCard } from '@/components/cards/GalleryAlbumCard';

export default function GaleriaPage() {
    const t = useTranslations();
    const [albums, setAlbums] = useState<GalleryAlbumWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlbums = async () => {
            try {
                const data = await galleryService.getAlbums();
                // Show only public albums
                setAlbums(data.filter(a => a.is_public));
            } catch (error) {
                console.error("Failed to load gallery albums:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAlbums();
    }, []);

    return (
        <main className="min-h-screen bg-app transition-colors duration-300">
            {/* Editorial Header */}
            <div className="pt-6 pb-16 px-6 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.2em] shadow-sm border border-accent/5">
                        <Camera className="w-4 h-4 animate-pulse" />
                        {t('gallery.label')}
                    </span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">
                    {t('gallery.title')}
                </h1>
                <p className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-muted max-w-xl mx-auto leading-relaxed">
                    {t('gallery.subtitle')}
                </p>
            </div>

            {/* Albums Grid */}
            <div className="max-w-[1400px] mx-auto pb-32 px-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-[400px] bg-surface/50 animate-pulse rounded-2xl border border-app" />
                        ))}
                    </div>
                ) : albums.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted">Nenhuma galeria disponível no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {albums.map((album) => (
                            <GalleryAlbumCard key={album.id} album={album} isGrid />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

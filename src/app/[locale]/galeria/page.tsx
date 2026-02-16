import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { Camera } from 'lucide-react';
import { GalleryAlbumCard } from '@/components/cards/GalleryAlbumCard';
import { GalleryAlbumWithStats } from '@/types/gallery';
import GalleryAccessButton from './GalleryAccessButton';

// Convertido para Server Component para habilitar ISR e eliminar fetch client-side
export const revalidate = 300; // Revalida a cada 5 minutos

export default async function GaleriaPage() {
    const t = await getTranslations();
    const supabase = await createClient();

    const { data: albums } = await supabase
        .from('gallery_album_stats')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    const publicAlbums = (albums ?? []) as GalleryAlbumWithStats[];

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
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
                    {t('gallery.title')}
                </h1>
                <p className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-muted max-w-xl mx-auto leading-relaxed">
                    {t('gallery.subtitle')}
                </p>
                <GalleryAccessButton />
            </div>

            {/* Albums Grid */}
            <div className="max-w-[1400px] mx-auto pb-32 px-6">
                {publicAlbums.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted">Nenhuma galeria disponível no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publicAlbums.map((album) => (
                            <GalleryAlbumCard key={album.id} album={album} isGrid />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

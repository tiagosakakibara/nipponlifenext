"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Camera, Plus, Eye, Trash2, Edit2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { storageService } from '@/lib/storageService';

interface GalleryAlbum {
    id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
    view_count: number;
    photo_count: number;
    created_at: string;
    status: string;
}

export default function AdminGalleryPage() {
    const t = useTranslations();
    const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            // 1. Fetch albums from stats view (contains photo_count)
            const { data: albumsData, error: albumsError } = await supabase
                .from('gallery_album_stats')
                .select('*')
                .order('created_at', { ascending: false });

            if (albumsError) throw albumsError;

            if (!albumsData || albumsData.length === 0) {
                setAlbums([]);
                return;
            }

            // 2. Extract cover photo IDs
            const coverIds = albumsData
                .map(a => a.cover_photo_id)
                .filter(id => id !== null) as string[];

            // 3. Fetch cover images
            let photoMap: Record<string, string> = {};
            if (coverIds.length > 0) {
                const { data: photosData } = await supabase
                    .from('gallery_photos')
                    .select('id, image_url')
                    .in('id', coverIds);

                if (photosData) {
                    photosData.forEach(p => {
                        photoMap[p.id] = p.image_url;
                    });
                }
            }

            // 4. Merge data
            const formattedAlbums: GalleryAlbum[] = albumsData.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                cover_image_url: a.cover_photo_id ? photoMap[a.cover_photo_id] : null,
                view_count: a.view_count || 0,
                photo_count: a.photo_count || 0,
                created_at: a.created_at,
                status: a.status
            }));

            setAlbums(formattedAlbums);
        } catch (err) {
            console.error('Error fetching albums:', err);
            setError('Erro ao carregar álbuns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este álbum?')) return;

        try {
            const { error } = await supabase
                .from('gallery_albums')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setAlbums(albums.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting album:', err);
            alert('Erro ao deletar álbum');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-link" />
                    <p className="text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                        <Camera className="w-8 h-8 text-[#D70F24]" />
                        Galeria de Fotos
                    </h1>
                    <p className="text-secondary text-sm mt-1">Gerencie álbuns e fotos da galeria</p>
                </div>
                <Link
                    href="/admin/gallery/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D70F24] to-rose-600 hover:to-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#D70F24]/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Novo Álbum
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Total de Álbuns</p>
                            <h3 className="text-4xl font-black text-primary">{albums.length}</h3>
                        </div>
                        <div className="p-4 rounded-xl bg-[#D70F24]/10">
                            <ImageIcon className="w-8 h-8 text-[#D70F24]" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Total de Fotos</p>
                            <h3 className="text-4xl font-black text-primary">
                                {albums.reduce((acc, a) => acc + (a.photo_count || 0), 0)}
                            </h3>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10">
                            <Camera className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-app shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2">Total de Views</p>
                            <h3 className="text-4xl font-black text-primary">
                                {albums.reduce((acc, a) => acc + (a.view_count || 0), 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10">
                            <Eye className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                    {error}
                </div>
            )}

            {/* Albums Grid */}
            {albums.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border-2 border-dashed border-app">
                    <Camera className="w-16 h-16 text-secondary/20 mx-auto mb-4" />
                    <p className="text-secondary/40 font-bold uppercase tracking-widest">Nenhum álbum encontrado</p>
                    <Link
                        href="/admin/gallery/new"
                        className="inline-flex items-center gap-2 mt-4 text-link hover:underline font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Criar primeiro álbum
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="bg-surface rounded-2xl border border-app shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-link/10 transition-all"
                        >
                            {/* Cover Image */}
                            <div className="relative h-48 bg-gray-900 overflow-hidden">
                                {album.cover_image_url ? (
                                    <Image
                                        src={storageService.getFileUrl(album.cover_image_url)}
                                        alt={album.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-16 h-16 text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                                    {album.photo_count || 0} fotos
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">
                                    {album.title}
                                </h3>
                                {album.description && (
                                    <p className="text-sm text-secondary mb-4 line-clamp-2">
                                        {album.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-secondary mb-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {album.view_count || 0}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full font-bold ${album.status === 'published'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-secondary/10 text-secondary'
                                        }`}>
                                        {album.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/gallery/${album.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-link/10 hover:bg-link/20 text-link px-4 py-2 rounded-xl font-bold transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(album.id)}
                                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl font-bold transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Camera, ChevronLeft, Save, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';
import { storageService } from '@/lib/storageService';
import { MediaUploader } from '@/components/MediaUploader'; // Assuming this exists or simple input
import { galleryService } from '@/lib/galleryService'; // We'll implement this if missing

interface GalleryAlbum {
    id?: string; // Optional for new
    title: string;
    description: string;
    status: 'draft' | 'published';
    cover_photo_id?: string | null;
    custom_author_name?: string | null;
}

interface GalleryPhoto {
    id: string;
    image_url: string;
    title: string | null;
    is_cover: boolean;
}

interface AdminGalleryFormClientProps {
    albumId?: string; // If present, edit mode
}

export default function AdminGalleryFormClient({ albumId }: AdminGalleryFormClientProps) {
    // Hooks
    const t = useTranslations('admin.galleryPage'); // Correct key
    const router = useRouter();
    const supabase = createClient();

    // State
    const [loading, setLoading] = useState(!!albumId);
    const [saving, setSaving] = useState(false);
    const [album, setAlbum] = useState<GalleryAlbum>({
        title: '',
        description: '',
        status: 'draft',
        custom_author_name: ''
    });
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [uploading, setUploading] = useState(false);

    // Fetch Album Data if Editing
    useEffect(() => {
        if (!albumId) return;

        const fetchAlbum = async () => {
            try {
                // 1. Get Album
                const { data: albumData, error } = await supabase
                    .from('gallery_albums')
                    .select('*')
                    .eq('id', albumId)
                    .single();

                if (error) throw error;
                if (albumData) {
                    setAlbum({
                        id: albumData.id,
                        title: albumData.title,
                        description: albumData.description || '',
                        status: albumData.status,
                        cover_photo_id: albumData.cover_photo_id,
                        custom_author_name: albumData.custom_author_name
                    });
                }

                // 2. Get Photos
                const { data: photosData, error: photosError } = await supabase
                    .from('gallery_photos')
                    .select('*')
                    .eq('album_id', albumId)
                    .order('created_at', { ascending: false });

                if (photosError) throw photosError;
                if (photosData) {
                    setPhotos(photosData.map(p => ({
                        id: p.id,
                        image_url: p.image_url,
                        title: p.title,
                        is_cover: p.id === albumData.cover_photo_id
                    })));
                }

            } catch (err) {
                console.error('Error fetching album:', err);
                toast.error('Erro ao carregar álbum');
                router.push('/admin/gallery');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [albumId, supabase, router]);

    // Handlers
    const handleSave = async () => {
        if (!album.title.trim()) {
            toast.error('O título é obrigatório');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            let savedAlbumId = albumId;

            // 1. Create or Update Album
            if (albumId) {
                const { error } = await supabase
                    .from('gallery_albums')
                    .update({
                        title: album.title,
                        description: album.description,
                        status: album.status,
                        cover_photo_id: album.cover_photo_id,
                        custom_author_name: album.custom_author_name,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', albumId);

                if (error) throw error;
                toast.success(t('albumSaved'));
            } else {
                const { data, error } = await supabase
                    .from('gallery_albums')
                    .insert({
                        title: album.title,
                        description: album.description,
                        status: album.status,
                        created_by: user.id,
                        custom_author_name: album.custom_author_name
                    })
                    .select()
                    .single();

                if (error) throw error;
                savedAlbumId = data.id;
                toast.success(t('albumSaved'));
                // Redirect to edit page to allow photo uploads immediately
                router.replace(`/admin/gallery/${savedAlbumId}`);
                return;
            }

            // Stay on same page after saving (no redirect)
            router.refresh();
        } catch (err) {
            console.error('Error saving album:', err);
            toast.error(t('uploadError'));
        } finally {
            setSaving(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!albumId) {
            toast.error(t('saveAlbumFirst'));
            return;
        }

        setUploading(true);
        const files = Array.from(e.target.files);
        let successCount = 0;

        try {
            for (const file of files) {
                // Use API route to upload and save to database (bypasses RLS)
                const formData = new FormData();
                formData.append('file', file);
                formData.append('albumId', albumId);

                const response = await fetch('/api/gallery/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Upload error:', errorData.error);
                    continue;
                }

                const photoData = await response.json();

                // Update local state
                setPhotos(prev => [{
                    id: photoData.id,
                    image_url: photoData.image_url,
                    title: photoData.title,
                    is_cover: false
                }, ...prev]);
                successCount++;
            }

            if (successCount > 0) toast.success(t('photosUploaded'));
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(t('uploadError'));
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm(t('confirmDeletePhoto'))) return;
        try {
            const { error } = await supabase
                .from('gallery_photos')
                .delete()
                .eq('id', photoId);

            if (error) throw error;
            setPhotos(prev => prev.filter(p => p.id !== photoId));


            // If deleting cover, unset cover
            if (album.cover_photo_id === photoId) {
                setAlbum(prev => ({ ...prev, cover_photo_id: null }));
                // Update DB immediately for cover consistency? Or wait for save?
                // Better wait for save or do it now. 
                // Let's do it now for consistency.
                await supabase.from('gallery_albums').update({ cover_photo_id: null }).eq('id', albumId!);
            }

            toast.success(t('photoRemoved'));
        } catch (err) {
            console.error(err);
            toast.error(t('deletePhotoError'));
        }
    };

    const handleSetCover = async (photoId: string) => {
        setAlbum(prev => ({ ...prev, cover_photo_id: photoId }));
        // Also update local photos state to reflect visual change if needed (is_cover flag)
        setPhotos(prev => prev.map(p => ({ ...p, is_cover: p.id === photoId })));

        // Save immediately for better UX
        if (albumId) {
            await supabase
                .from('gallery_albums')
                .update({ cover_photo_id: photoId })
                .eq('id', albumId);
            toast.success(t('coverUpdated'));
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex bg-surface sticky top-0 z-20 p-4 -mx-4 sm:mx-0 sm:p-0 sm:static items-center justify-between gap-4 border-b border-app sm:border-none shadow-sm sm:shadow-none mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-app rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-secondary" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-primary tracking-tight">
                            {albumId ? t('editAlbum') : t('newAlbum')}
                        </h1>
                        <p className="text-secondary text-sm font-medium">
                            {albumId ? t('manageDetails') : t('createCollection')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? t('saving') : t('save')}
                </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-secondary">{t('albumTitle')}</label>
                            <input
                                type="text"
                                value={album.title}
                                onChange={e => setAlbum(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-app/50 border border-app rounded-xl p-4 text-primary font-bold focus:border-link outline-none transition-colors"
                                placeholder={t('albumTitlePlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-secondary">{t('albumDescription')}</label>
                            <textarea
                                value={album.description}
                                onChange={e => setAlbum(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full bg-app/50 border border-app rounded-xl p-4 text-primary font-medium focus:border-link outline-none transition-colors resize-none"
                                placeholder={t('albumDescriptionPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-secondary">{t('albumStatus')}</label>
                            <div className="flex gap-2 p-1 bg-app/50 rounded-xl border border-app">
                                <button
                                    onClick={() => setAlbum(prev => ({ ...prev, status: 'published' }))}
                                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${album.status === 'published'
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : 'text-secondary hover:bg-white/50 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {t('published')}
                                </button>
                                <button
                                    onClick={() => setAlbum(prev => ({ ...prev, status: 'draft' }))}
                                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${album.status === 'draft'
                                        ? 'bg-zinc-500 text-white shadow-lg'
                                        : 'text-secondary hover:bg-white/50 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {t('draft')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cover Preview */}
                    <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary">{t('coverPhoto')}</h3>
                        <div className="aspect-video bg-app/50 rounded-2xl overflow-hidden border border-app border-dashed flex items-center justify-center relative">
                            {album.cover_photo_id && photos.find(p => p.id === album.cover_photo_id) ? (
                                <Image
                                    src={storageService.getFileUrl(photos.find(p => p.id === album.cover_photo_id)!.image_url)}
                                    alt="Album cover"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-8 h-8 text-secondary/30 mx-auto mb-2" />
                                    <p className="text-xs text-secondary/50 font-medium">{t('selectCoverPlaceholder')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary">{t('authorInfo')}</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary">{t('photographerName')}</label>
                            <input
                                type="text"
                                value={album.custom_author_name || ''}
                                onChange={e => setAlbum(prev => ({ ...prev, custom_author_name: e.target.value }))}
                                className="w-full bg-app/50 border border-app rounded-xl p-4 text-primary font-bold focus:border-link outline-none transition-colors"
                                placeholder={t('photographerNamePlaceholder')}
                            />
                        </div>

                        <div className="pt-4 border-t border-app">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 shadow-lg"
                                style={{ backgroundColor: '#D70F24', color: '#fff' }}
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? t('saving') : t('saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Photos Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface p-6 rounded-[32px] border border-app shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-primary flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-link" />
                                {t('photos')} ({photos.length})
                            </h3>
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    disabled={!albumId || uploading}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!albumId) {
                                            toast.loading('Salvando álbum para habilitar uploads...', { duration: 2000 });
                                            handleSave();
                                            return;
                                        }
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                            fileInputRef.current.click();
                                        }
                                    }}
                                    disabled={uploading}
                                    className={`flex items-center gap-2 bg-app hover:bg-app/80 text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all border border-app ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {uploading ? t('uploading') : t('addPhotos')}
                                </button>
                            </div>
                        </div>

                        {!albumId ? (
                            <div
                                onClick={handleSave}
                                className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-app rounded-2xl bg-app/20 cursor-pointer hover:bg-app/40 transition-colors group"
                            >
                                <Save className="w-12 h-12 text-secondary/20 mb-4 group-hover:text-primary transition-colors" />
                                <p className="text-secondary font-medium group-hover:text-primary transition-colors">{t('saveFirst')}</p>
                                <p className="text-secondary/50 text-xs mt-2 uppercase tracking-wide font-bold group-hover:text-primary/70">{t('clickToSave')}</p>
                            </div>
                        ) : photos.length === 0 ? (
                            <div
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                        fileInputRef.current.click();
                                    }
                                }}
                                className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-app rounded-2xl bg-app/20 cursor-pointer hover:bg-app/40 transition-colors group"
                            >
                                <ImageIcon className="w-12 h-12 text-secondary/20 mb-4 group-hover:text-primary transition-colors" />
                                <p className="text-secondary font-medium group-hover:text-primary transition-colors">{t('noPhotosYet')}</p>
                                <p className="text-secondary/50 text-sm mt-1">{t('dragDropOrClick')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="group relative aspect-square bg-app rounded-xl overflow-hidden border border-app">
                                        <Image
                                            src={storageService.getFileUrl(photo.image_url)}
                                            alt={photo.title || 'Gallery photo'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                            <button
                                                onClick={() => handleSetCover(photo.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest w-full ${photo.id === album.cover_photo_id
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white/20 text-white hover:bg-white/40'
                                                    }`}
                                            >
                                                {photo.id === album.cover_photo_id ? t('currentCover') : t('setCover')}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                title={t('deletePhoto')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Cover Indicator (Visible even without hover) */}
                                        {photo.id === album.cover_photo_id && (
                                            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg">
                                                CAPA
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

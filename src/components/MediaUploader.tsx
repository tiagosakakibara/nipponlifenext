"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { storageService } from '@/lib/storageService';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ResponsiveImage } from '@/components/ResponsiveImage';

interface MediaUploaderProps {
    value: string | null | undefined;
    onChange: (url: string | null) => void;
    folderPrefix?: 'profiles' | 'businesses' | 'posts' | 'jobs' | 'events' | 'guides' | 'gallery' | 'media' | 'community' | 'logos' | 'covers' | 'documents';
    label?: string;
    allowedTypes?: ('image' | 'video')[];
    className?: string;
    noContainer?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
    value,
    onChange,
    folderPrefix,
    label = "Featured Image",
    allowedTypes = ['image'],
    className = "",
    noContainer = false
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const [imageError, setImageError] = useState(false);

    // Reset error state when value changes (e.g. new upload)
    useEffect(() => {
        setImageError(false);
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('📁 [MediaUploader] File input changed');
        const file = e.target.files?.[0];
        if (!file) {
            console.log('📁 [MediaUploader] No file selected');
            return;
        }

        console.log('📁 [MediaUploader] File selected:', file.name, file.type, file.size);

        // Validate file type
        const fileType = file.type.split('/')[0];
        if (!allowedTypes.includes(fileType as any)) {
            setError(`Please upload a ${allowedTypes.join(' or ')} file.`);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            return;
        }

        // Validate file size (max 50MB for video, 5MB for image)
        const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File size should be less than ${maxSize / 1024 / 1024}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            return;
        }

        try {
            console.log('🚀 [MediaUploader] Starting upload...');
            setIsUploading(true);
            setError(null);

            // Use unified storage service
            const publicUrl = await storageService.uploadFile(file, folderPrefix || 'media');
            console.log('✅ [MediaUploader] Upload success, URL:', publicUrl);

            // 3. Save metadata to public.media table
            const { data: { user } } = await supabase.auth.getUser();

            const { error: dbError } = await supabase
                .from('media')
                .insert({
                    bucket: 'media',
                    path: publicUrl, // or relative path if preferred
                    public_url: publicUrl,
                    mime_type: file.type,
                    size_bytes: file.size,
                    created_by: user?.id
                });

            if (dbError) {
                console.error('Error saving to media table:', dbError);
                // We continue anyway as the upload was successful and we have the URL
            }

            onChange(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Error uploading file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        onChange(null);
    };

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    return (
        <div className={noContainer ? className : `bg-surface rounded-lg shadow-sm border border-app overflow-hidden ${className}`}>
            {!noContainer && (
                <div className="p-4 border-b border-app bg-surface/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white">{label}</h3>
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                </div>
            )}

            <div className={noContainer ? "" : "p-4 space-y-4"}>
                {isUploading && noContainer && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-bold">Uploading media... please wait</span>
                    </div>
                )}
                {value ? (
                    <div className="space-y-3">
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group">
                            {isVideo(value) ? (
                                <video
                                    src={storageService.getFileUrl(value)}
                                    className="w-full h-full object-contain"
                                    controls
                                />
                            ) : (
                                <>
                                    <img
                                        src={storageService.getFileUrl(value)}
                                        alt="Upload preview"
                                        className={`w-full h-full object-contain transition-opacity duration-300 ${imageError ? 'hidden' : 'block'}`}
                                        onError={() => setImageError(true)}
                                    />
                                    {/* Fallback for broken images */}
                                    <div className={`${imageError ? 'flex' : 'hidden'} absolute inset-0 flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-white/5`}>
                                        <div className="p-4 rounded-full bg-zinc-100 dark:bg-white/10 mb-2">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                        <span className="text-xs font-medium">Image not found</span>
                                    </div>
                                </>
                            )}

                            {/* Actions Overlay - Always visible on hover or if image is broken, but accessible */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Upload button clicked');
                                        fileInputRef.current?.click();
                                    }}
                                    className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 p-3 bg-white text-zinc-800 rounded-full hover:bg-zinc-50 shadow-lg border border-zinc-100"
                                    title="Change image"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeImage();
                                    }}
                                    className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 delay-75 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg shadow-red-600/20"
                                    title="Remove file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Show URL only if it looks like a broken legacy link for verify purposes, otherwise hide */}
                        <div className="hidden text-[10px] text-zinc-400 px-1 truncate">{storageService.getFileUrl(value)}</div>
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${isUploading
                            ? 'bg-white/5 border-white/10 cursor-not-allowed text-gray-500'
                            : noContainer
                                ? 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer text-gray-600'
                                : 'border-zinc-200 dark:border-white/10 hover:border-accent hover:bg-[var(--nl-accent)]/5 cursor-pointer text-zinc-400 dark:text-zinc-500'
                            }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                <span className="text-xs font-medium text-zinc-500">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <div className={noContainer ? "p-3 bg-white/5 border border-white/10 rounded-full shadow-sm" : "p-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full shadow-sm"}>
                                    <Upload className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="text-center">
                                    <span className={noContainer ? "text-xs font-semibold text-gray-400 block" : "text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"}>Click to upload</span>
                                    <span className="text-[10px] text-zinc-400 font-medium">Original format (max 50MB)</span>
                                </div>
                            </>
                        )}
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {error && (
                    <div className="p-2 bg-red-50 border border-red-100 rounded text-[11px] text-red-600 font-medium">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

'use client';

import React, { useState } from 'react';
import { storageService } from '@/lib/storageService';

interface ResponsiveImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    fill?: boolean; // For compatibility with Next.js patterns if passed
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
    src,
    alt,
    className = "w-full h-full object-cover",
    fallbackSrc = "https://via.placeholder.com/800x450?text=No+Image"
}) => {
    // Generate URL using storageService (helper to resolve buckets)
    const initialUrl = storageService.getFileUrl(src) || fallbackSrc;
    const [imgSrc, setImgSrc] = useState(initialUrl);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => {
                if (imgSrc !== fallbackSrc) {
                    setImgSrc(fallbackSrc);
                }
            }}
        />
    );
};

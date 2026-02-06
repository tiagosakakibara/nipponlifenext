'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { storageService } from '@/lib/storageService';

interface ResponsiveImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    quality?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
    src,
    alt,
    className = "w-full h-full object-cover",
    fallbackSrc = "https://via.placeholder.com/800x450?text=No+Image",
    fill = true,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    priority = false,
    quality
}) => {
    const rawUrl = storageService.getFileUrl(src);
    const [isError, setIsError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setIsError(false);
    }, [src]);

    const finalSrc = (isError || !rawUrl) ? fallbackSrc : rawUrl;

    // Detect object-fit preference from className
    const objectFit = className.includes('object-contain') ? 'object-contain' : 'object-cover';

    // Combine classes: ensure relative positioning and overflow hidden for border-radius to work
    // We append the passed className so width/height/rounding/margins apply to this container.
    const containerClasses = `relative overflow-hidden ${className}`;

    return (
        <div className={containerClasses}>
            <Image
                src={finalSrc}
                alt={alt}
                fill={fill}
                sizes={sizes}
                priority={priority}
                quality={quality}
                className={objectFit}
                onError={() => setIsError(true)}
            />
        </div>
    );
};

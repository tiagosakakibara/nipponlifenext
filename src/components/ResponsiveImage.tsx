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
    fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E",
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
                unoptimized={true} // Bypass Next.js optimization to fix Supabase loading issues
            />
        </div>
    );
};

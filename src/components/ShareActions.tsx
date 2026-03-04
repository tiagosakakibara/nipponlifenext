'use client';

import { useState } from 'react';
import { Share2, X, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ShareActionsProps {
    url?: string;
    title?: string;
    text?: string;
    className?: string;
    variant?: 'sidebar' | 'inline';
}

export function ShareActions({
    url,
    title,
    text,
    className = '',
    variant = 'sidebar'
}: ShareActionsProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [copied, setCopied] = useState(false);

    // Provide default fallback if translation key missing
    const shareText = text || t('news.shareText');

    const getShareUrl = () => {
        if (typeof window === 'undefined') return '';
        let baseUrl = url || window.location.href;

        // Verify if a local url leaked to client running on a real domain
        if (url && url.startsWith('http://localhost') && !window.location.href.startsWith('http://localhost')) {
            try {
                const urlObj = new URL(url);
                baseUrl = window.location.origin + urlObj.pathname + urlObj.search;
            } catch (e) {
                // Ignore parsing errors
            }
        } else if (url && url.startsWith('/')) {
            baseUrl = window.location.origin + url;
        }

        try {
            const shareUrl = new URL(baseUrl);
            shareUrl.searchParams.set('lng', locale);
            return shareUrl.toString();
        } catch (e) {
            return baseUrl;
        }
    };

    const getShareTitle = () => {
        if (typeof document === 'undefined') return title || '';
        return title || document.title;
    };

    const handleNativeShare = async () => {
        const shareUrl = getShareUrl();
        const shareTitle = getShareTitle();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const handleShareX = () => {
        const shareUrl = getShareUrl();
        const shareTitle = getShareTitle();
        const tweetText = encodeURIComponent(`${shareTitle} - ${shareText}`);
        const tweetUrl = encodeURIComponent(shareUrl);
        window.open(
            `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleShareFacebook = () => {
        const shareUrl = getShareUrl();
        const fbUrl = encodeURIComponent(shareUrl);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleCopyLink = async () => {
        const shareUrl = getShareUrl();
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert(`Link copiado: ${shareUrl}`);
        }
    };

    if (variant === 'sidebar') {
        return (
            <div className={`flex flex-col gap-4 ${className}`}>
                <button
                    onClick={handleNativeShare}
                    className="w-12 h-12 rounded-full bg-surface border border-app flex items-center justify-center hover:bg-[var(--nl-accent)] hover:border-[var(--nl-accent)] transition-all group shadow-sm"
                    aria-label={t('common.share')}
                    title={t('common.share')}
                >
                    <Share2 className="w-5 h-5 text-secondary group-hover:text-white" />
                </button>
                <button
                    onClick={handleShareX}
                    className="w-12 h-12 rounded-full bg-surface border border-app flex items-center justify-center hover:bg-black hover:border-black transition-all group shadow-sm"
                    aria-label={t('common.shareX')}
                    title={t('common.shareX')}
                >
                    <X className="w-5 h-5 text-secondary group-hover:text-white" />
                </button>
                <button
                    onClick={handleShareFacebook}
                    className="w-12 h-12 rounded-full bg-surface border border-app flex items-center justify-center hover:bg-[#4267B2] hover:border-[#4267B2] transition-all group shadow-sm"
                    aria-label={t('common.shareFB')}
                    title={t('common.shareFB')}
                >
                    <Facebook className="w-5 h-5 text-secondary group-hover:text-white" />
                </button>
                <button
                    onClick={handleCopyLink}
                    className="w-12 h-12 rounded-full bg-surface border border-app flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all group shadow-sm"
                    aria-label={t('common.copyLink')}
                    title={copied ? t('common.copied') : t('common.copyLink')}
                >
                    {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                    ) : (
                        <LinkIcon className="w-5 h-5 text-secondary group-hover:text-primary" />
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            <button
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-app rounded-xl text-sm font-medium text-secondary hover:text-[var(--nl-accent)] hover:border-[var(--nl-accent)]/30 transition-all"
                aria-label={t('common.share')}
            >
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline">{t('common.share')}</span>
            </button>
            <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-app rounded-xl text-sm font-medium text-secondary hover:text-black hover:border-black/30 transition-all"
                aria-label="Twitter"
            >
                <X className="w-4 h-4" />
            </button>
            <button
                onClick={handleShareFacebook}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-app rounded-xl text-sm font-medium text-secondary hover:text-[#4267B2] hover:border-[#4267B2]/30 transition-all"
                aria-label="Facebook"
            >
                <Facebook className="w-4 h-4" />
            </button>
            <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-app rounded-xl text-sm font-medium text-secondary hover:text-primary hover:border-app transition-all"
                aria-label={copied ? "Copiado" : "Copiar"}
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="hidden lg:inline text-green-600">{t('common.copied')}</span>
                    </>
                ) : (
                    <>
                        <LinkIcon className="w-4 h-4" />
                        <span className="hidden lg:inline">{t('common.copy')}</span>
                    </>
                )}
            </button>
        </div>
    );
}

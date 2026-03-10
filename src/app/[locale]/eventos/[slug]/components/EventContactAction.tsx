'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EventContactActionProps {
    contactUrl?: string | null;
    className?: string;
}

export function EventContactAction({ contactUrl, className = '' }: EventContactActionProps) {
    const t = useTranslations('eventDetails');

    const handleContact = () => {
        if (contactUrl) {
            const contact = contactUrl.trim();
            if (/^\+?[\d\s-]{8,}$/.test(contact)) {
                window.location.href = `tel:${contact.replace(/[\s-]/g, '')}`;
            } else if (/^https?:\/\//i.test(contact)) {
                window.open(contact, '_blank', 'noopener,noreferrer');
            } else {
                const url = contact.includes('.') ? `https://${contact}` : contact;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } else {
            alert(t('noContact'));
        }
    };

    if (!contactUrl) return null;

    return (
        <button
            onClick={handleContact}
            className={`group inline-flex w-full md:w-auto items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--nl-accent)] to-[#E60039] hover:from-[var(--nl-primary)] hover:to-[var(--nl-accent)] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl md:rounded-full transition-all duration-300 shadow-xl shadow-red-600/20 hover:shadow-2xl hover:shadow-red-600/40 hover:-translate-y-1 active:scale-95 ${className}`}
        >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>{t('contact')}</span>
        </button>
    );
}

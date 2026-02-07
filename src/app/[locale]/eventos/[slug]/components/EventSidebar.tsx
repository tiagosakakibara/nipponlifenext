'use client';

import { Calendar, Eye, MessageCircle, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ShareActions } from '@/components/ShareActions';

interface EventSidebarProps {
    contactUrl?: string | null;
    viewCount?: number | null;
    dateStr: string;
    title: string;
}

export function EventSidebar({ contactUrl, viewCount, dateStr, title }: EventSidebarProps) {
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

    return (
        <div className="p-8 bg-surface rounded-[40px] border border-app sticky top-24 space-y-8 shadow-sm">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-app flex items-center justify-center text-[#D70F24] shadow-sm">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Data e Hora</p>
                        <p className="text-sm font-bold text-primary leading-tight">{dateStr}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-app flex items-center justify-center text-[#D70F24] shadow-sm">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Visualizações</p>
                        <p className="text-sm font-bold text-primary leading-tight">{viewCount || 0}</p>
                    </div>
                </div>
            </div>

            <div className="h-px bg-app/10" />

            <div className="space-y-4">
                <button
                    onClick={handleContact}
                    className="w-full py-4 bg-[#D70F24] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-4 h-4" />
                    {t('contact')}
                </button>

                <div className="flex items-center gap-2">
                    <ShareActions
                        title={title}
                        text={t('shareText', { title })}
                        className="flex-1"
                        variant="inline"
                    />
                </div>
            </div>
        </div>
    );
}

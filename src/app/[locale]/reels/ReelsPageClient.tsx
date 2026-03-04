"use client";

import { useState } from "react";
import { Play, Film, Video } from "lucide-react";
import { CommunityReel } from "@/lib/reelsService";
import { ReelModal } from "@/app/[locale]/comunidade/components/ReelModal";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface ReelsPageClientProps {
  reels: CommunityReel[];
}

export default function ReelsPageClient({ reels }: ReelsPageClientProps) {
  const t = useTranslations();
  const [selectedReel, setSelectedReel] = useState<CommunityReel | null>(null);

  return (
    <div className="min-h-screen bg-app">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden bg-surface border-b border-app">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 dark:from-red-900/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="opacity-50">/</span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                {t("reels.communityReels")}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary tracking-tight leading-tight">
              {t("reels.galleryTitle")}
            </h1>
            <p className="text-lg text-secondary font-medium max-w-xl mx-auto">
              {t("reels.gallerySubtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="container mx-auto px-6 py-12">
        {reels.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-app">
            <Film className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary">
              {t("reels.noReels")}
            </h3>
            <p className="text-muted text-sm mt-2">{t("reels.beFirst")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {reels.map((reel) => (
              <button
                key={reel.id}
                onClick={() => setSelectedReel(reel)}
                className="relative group w-full aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--nl-accent)] focus:ring-offset-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-300 z-10" />

                {/* Border Overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--nl-accent)]/50 rounded-2xl transition-all duration-300 z-30 pointer-events-none" />

                {/* Thumbnail */}
                {reel.thumbnail_url ? (
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.title || "Reel"}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${reel.provider === "youtube" ? "scale-[1.35] group-hover:scale-[1.5]" : "group-hover:scale-110"}`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface flex items-center justify-center">
                    <Film className="w-10 h-10 text-muted/30" />
                  </div>
                )}

                {/* Play Icon */}
                {reel.provider === "youtube" && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-90 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 bg-[var(--nl-accent)]/90 rounded-full flex items-center justify-center shadow-xl border border-white/20 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Title */}
                {reel.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-left">
                    <span className="text-white text-sm font-bold font-display drop-shadow-lg line-clamp-2 leading-tight group-hover:text-[var(--nl-accent)] transition-colors">
                      {reel.title}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedReel && (
        <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
      )}
    </div>
  );
}

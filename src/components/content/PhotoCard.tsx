"use client";

import { useState } from "react";
import Image from "next/image";
import { Share2, Download, Heart } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { likePhotoClient } from "@/lib/likes";
import type { Photo } from "@/lib/mock-data";

/** Item de galería (masonry). Acciones share/download al pasar/tocar. */
export function PhotoCard({
  photo,
  label,
  onShare,
  onDownload,
}: {
  photo: Photo;
  label: string;
  onShare?: (p: Photo) => void;
  onDownload?: (p: Photo) => void;
}) {
  const router = useRouter();
  const [likes, setLikes] = useState(photo.likes ?? 0);
  const [liked, setLiked] = useState(false);

  async function like() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1); // optimista
    const total = await likePhotoClient(photo.id);
    if (total !== null) setLikes(total);
  }

  return (
    <div className="group relative mb-2.5 break-inside-avoid overflow-hidden rounded-sm border border-line">
      <button
        type="button"
        onClick={() => router.push(`/foto/${photo.id}`)}
        className="block w-full"
        aria-label={label}
      >
        <Image
          src={photo.thumbUrl}
          alt={label}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 768px) 50vw, 320px"
          className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="overlay-vert pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
        {photo.printCode && (
          <span className="absolute left-2 top-2 rounded-pill bg-brand/90 px-2 py-0.5 font-mono text-[9px] font-bold text-brand-ink">
            #{photo.printCode}
          </span>
        )}
        <span className="absolute bottom-2 left-2 font-mono text-[9px] font-semibold uppercase tracking-wide text-white/90">
          {label}
        </span>
      </button>

      {/* Me gusta (público) */}
      <button
        type="button"
        onClick={like}
        aria-label="me gusta"
        className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-white backdrop-blur transition active:scale-95"
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-brand text-brand" : ""}`} />
        {likes > 0 && <span className="font-mono text-[11px] font-semibold">{likes}</span>}
      </button>

      {/* Visibles en táctil (móvil); en escritorio aparecen al pasar el ratón. */}
      <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onShare?.(photo)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
          aria-label="share"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDownload?.(photo)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
          aria-label="download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

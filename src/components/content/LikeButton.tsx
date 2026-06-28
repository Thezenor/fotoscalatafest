"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { likePhotoClient, hasLiked } from "@/lib/likes";

export function LikeButton({
  photoId,
  initial,
  label,
}: {
  photoId: string;
  initial: number;
  label: string;
}) {
  const [likes, setLikes] = useState(initial);
  const [liked, setLiked] = useState(false);

  useEffect(() => setLiked(hasLiked(photoId)), [photoId]);

  async function like() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    const total = await likePhotoClient(photoId);
    if (total !== null) setLikes(total);
  }

  return (
    <button
      type="button"
      onClick={like}
      aria-pressed={liked}
      className="flex items-center justify-center gap-2 rounded-pill border border-line bg-surface-2 px-4 py-3 font-display text-[15px] font-bold text-white transition active:scale-95"
    >
      <Heart className={`h-5 w-5 ${liked ? "fill-brand text-brand" : "text-brand"}`} />
      {label}
      {likes > 0 && <span className="font-mono text-mist">· {likes}</span>}
    </button>
  );
}

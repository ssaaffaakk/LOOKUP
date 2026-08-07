"use client";

import type { Rarity } from "@/lib/types";

const rarityConfig: Record<Rarity, { label: string; bg: string; text: string }> = {
  common: {
    label: "Common",
    bg: "bg-white/[0.06]",
    text: "text-text-tertiary",
  },
  notable: {
    label: "Notable",
    bg: "bg-[#0a84ff]/[0.15]",
    text: "text-[#0a84ff]",
  },
  rare: {
    label: "Rare",
    bg: "bg-[#ff9f0a]/[0.15]",
    text: "text-[#ff9f0a]",
  },
  extraordinary: {
    label: "Extraordinary",
    bg: "bg-[#ffd60a]/[0.15]",
    text: "text-[#ffd60a]",
  },
  legendary: {
    label: "Legendary",
    bg: "bg-[#bf5af2]/[0.15]",
    text: "text-[#bf5af2]",
  },
};

interface RarityBadgeProps {
  rarity: Rarity;
  explanation?: string;
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em] ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

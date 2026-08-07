"use client";

import { motion } from "framer-motion";
import type { UpcomingEvent } from "@/lib/types";
import { RarityBadge } from "./RarityBadge";

interface UpcomingCardProps {
  event: UpcomingEvent;
  index: number;
}

export function UpcomingCard({ event, index }: UpcomingCardProps) {
  return (
    <motion.div
      className="rounded-2xl glass border border-border p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.4,
        delay: 0.8 + index * 0.08,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-accent tracking-[-0.01em]">
          {event.date}
        </span>
        <RarityBadge rarity={event.rarity} />
      </div>
      <h4 className="text-[16px] font-semibold tracking-[-0.02em] text-text-primary">
        {event.name}
      </h4>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
        {event.description}
      </p>
    </motion.div>
  );
}

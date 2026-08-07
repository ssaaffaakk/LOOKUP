"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CelestialObject, Equipment } from "@/lib/types";
import { equipmentVerdict } from "@/lib/equipment";
import { RarityBadge } from "./RarityBadge";

const typeLabels: Record<string, string> = {
  supernova: "Supernova",
  nova: "Nova",
  comet: "Comet",
  planet: "Planet",
  "deep-sky": "Deep Sky",
  "meteor-shower": "Meteor Shower",
  satellite: "Satellite",
  aurora: "Aurora",
  asteroid: "Asteroid",
};

interface ObjectCardProps {
  object: CelestialObject;
  index: number;
  equipment?: Equipment;
}

export function ObjectCard({ object, index, equipment }: ObjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const eqVerdict = equipment ? equipmentVerdict(object.minimumAperture, equipment) : null;

  return (
    <motion.button
      className="w-full text-left rounded-[20px] glass border border-border p-5 cursor-pointer active:scale-[0.97] transition-transform duration-100 ease-out"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.45,
        delay: 0.5 + index * 0.08,
      }}
      onClick={() => setExpanded(!expanded)}
      aria-expanded={expanded}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <RarityBadge rarity={object.rarity} />
            {object.isTransient && object.daysLeft && (
              <span className="text-[11px] text-[#ff453a] font-medium">
                {object.daysLeft}d left
              </span>
            )}
          </div>

          <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-text-primary leading-tight">
            {object.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-[13px] text-text-secondary">
            <span>{typeLabels[object.type] || object.type}</span>
            <span className="text-text-tertiary">·</span>
            <span>mag {object.magnitude > 0 ? object.magnitude : object.magnitude.toFixed(1)}</span>
            <span className="text-text-tertiary">·</span>
            <span>{object.constellation}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-1">
          <span className="text-[22px] font-bold tracking-[-0.02em] text-text-primary leading-none">
            {object.bestTime}
          </span>
          <span className="text-[11px] text-text-tertiary">best tonight</span>
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-[13px] ${
        eqVerdict
          ? eqVerdict.canSee
            ? "text-[#30d158]"
            : "text-[#ff9f0a]"
          : "text-text-tertiary"
      }`}>
        {eqVerdict ? (
          eqVerdict.canSee ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
              <path d="M4.5 7L6.5 9L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
              <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          )
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
            <path d="M7 3.5V7.5H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}
        <span>{eqVerdict ? eqVerdict.message : object.minimumAperture}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary mb-1.5">
                  What you'll actually see
                </p>
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  {object.whatYoullSee}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary mb-1.5">
                  Why this matters
                </p>
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  {object.whyItMatters}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary mb-1.5">
                  Rarity
                </p>
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  {object.rarityExplanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

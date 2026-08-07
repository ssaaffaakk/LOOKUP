"use client";

import { motion } from "framer-motion";
import type { SkyConditions } from "@/lib/types";

function qualityColor(value: number, invert = false): string {
  const v = invert ? 100 - value : value;
  if (v >= 70) return "#30d158";
  if (v >= 40) return "#ff9f0a";
  return "#ff453a";
}

function cloudLabel(v: number): string {
  if (v <= 15) return "Clear";
  if (v <= 40) return "Partly cloudy";
  if (v <= 70) return "Mostly cloudy";
  return "Overcast";
}

function moonLabel(v: number): string {
  if (v <= 10) return "New moon";
  if (v <= 35) return "Crescent";
  if (v <= 65) return "Half moon";
  if (v <= 85) return "Gibbous";
  return "Nearly full";
}

function seeingLabel(v: number): string {
  if (v >= 8) return "Excellent";
  if (v >= 6) return "Good";
  if (v >= 4) return "Fair";
  return "Poor";
}

function bortleLabel(v: number): string {
  if (v <= 2) return "Dark sky";
  if (v <= 4) return "Rural";
  if (v <= 6) return "Suburban";
  return "Urban";
}

interface ConditionPillProps {
  label: string;
  value: string;
  quality: string;
  qualityDot: string;
  index: number;
}

function ConditionPill({ label, value, quality, qualityDot, index }: ConditionPillProps) {
  return (
    <motion.div
      className="flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl glass border border-border min-w-[90px]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.4,
        delay: 0.4 + index * 0.06,
      }}
    >
      <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary">
        {label}
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
        {value}
      </span>
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: qualityDot }}
        />
        <span className="text-[11px] text-text-secondary">{quality}</span>
      </div>
    </motion.div>
  );
}

interface ConditionsStripProps {
  conditions: SkyConditions;
}

export function ConditionsStrip({ conditions }: ConditionsStripProps) {
  const pills = [
    {
      label: "Clouds",
      value: `${conditions.cloudCover}%`,
      quality: cloudLabel(conditions.cloudCover),
      qualityDot: qualityColor(conditions.cloudCover, true),
    },
    {
      label: "Moon",
      value: `${conditions.moonPhase}%`,
      quality: moonLabel(conditions.moonPhase),
      qualityDot: qualityColor(conditions.moonPhase, true),
    },
    {
      label: "Seeing",
      value: `${conditions.seeing}/10`,
      quality: seeingLabel(conditions.seeing),
      qualityDot: qualityColor(conditions.seeing * 10),
    },
    {
      label: "Bortle",
      value: `${conditions.bortle}`,
      quality: bortleLabel(conditions.bortle),
      qualityDot: qualityColor((10 - conditions.bortle) * 11),
    },
  ];

  return (
    <section className="px-4">
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {pills.map((pill, i) => (
          <ConditionPill key={pill.label} {...pill} index={i} />
        ))}
      </div>
    </section>
  );
}

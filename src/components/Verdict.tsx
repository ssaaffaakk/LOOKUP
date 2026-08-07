"use client";

import { motion } from "framer-motion";
import type { Verdict as VerdictType } from "@/lib/types";

const verdictConfig = {
  go: {
    label: "Go tonight.",
    color: "text-[#30d158]",
    glow: "rgba(48, 209, 88, 0.15)",
    dot: "bg-[#30d158]",
  },
  marginal: {
    label: "Maybe tonight.",
    color: "text-[#ff9f0a]",
    glow: "rgba(255, 159, 10, 0.12)",
    dot: "bg-[#ff9f0a]",
  },
  skip: {
    label: "Skip tonight.",
    color: "text-[rgba(235,235,245,0.6)]",
    glow: "rgba(255, 255, 255, 0.03)",
    dot: "bg-[rgba(235,235,245,0.3)]",
  },
} as const;

interface VerdictProps {
  verdict: VerdictType;
  reason: string;
  detail: string;
  nextWorthIt?: string;
}

export function Verdict({ verdict, reason, detail, nextWorthIt }: VerdictProps) {
  const config = verdictConfig[verdict];

  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-12 min-h-[70vh]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 40%, ${config.glow}, transparent)`,
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      >
        <motion.div
          className={`w-2 h-2 rounded-full ${config.dot} mb-6`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5, delay: 0.1 }}
        />

        <motion.h1
          className={`text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] ${config.color}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5, delay: 0.15 }}
        >
          {config.label}
        </motion.h1>

        <motion.p
          className="mt-4 text-[15px] leading-relaxed text-text-secondary max-w-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5, delay: 0.3 }}
        >
          {detail}
        </motion.p>

        {verdict === "skip" && nextWorthIt && (
          <motion.div
            className="mt-8 px-5 py-3 rounded-2xl glass border border-border"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5, delay: 0.45 }}
          >
            <p className="text-[13px] text-text-tertiary uppercase tracking-widest mb-1">
              Next worth going out
            </p>
            <p className="text-[15px] text-text-primary font-medium">
              {nextWorthIt}
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M4 7L10 13L16 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </section>
  );
}

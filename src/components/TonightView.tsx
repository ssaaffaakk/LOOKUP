"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { tonightGo, tonightSkip } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings-context";
import { Verdict } from "./Verdict";
import { ConditionsStrip } from "./ConditionsStrip";
import { ObjectCard } from "./ObjectCard";
import { UpcomingCard } from "./UpcomingCard";
import { BottomNav } from "./BottomNav";

export function TonightView() {
  const { settings } = useSettings();
  const [scenario, setScenario] = useState<"go" | "skip">("go");
  const baseData = scenario === "go" ? tonightGo : tonightSkip;
  const data = {
    ...baseData,
    location: settings.location ?? baseData.location,
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <motion.header
        className="fixed top-0 inset-x-0 z-50 glass border-b border-border pt-[env(safe-area-inset-top)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        <div className="flex items-center justify-between h-11 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-text-secondary"
            >
              <path
                d="M7 1.5C4.79 1.5 3 3.29 3 5.5C3 8.5 7 12.5 7 12.5S11 8.5 11 5.5C11 3.29 9.21 1.5 7 1.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <circle cx="7" cy="5.5" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-[13px] font-medium text-text-secondary">
              {data.location.name}
            </span>
          </div>
          <span className="text-[13px] text-text-tertiary tabular-nums">
            {data.date}
          </span>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto">
        {/* Verdict */}
        <Verdict
          verdict={data.verdict}
          reason={data.verdictReason}
          detail={data.verdictDetail}
          nextWorthIt={
            data.verdict === "skip"
              ? `${data.upcoming[0]?.date} — ${data.upcoming[0]?.name}`
              : undefined
          }
        />

        {/* Conditions */}
        <ConditionsStrip conditions={data.conditions} />

        {/* Objects */}
        <section className="px-4 mt-8">
          <motion.div
            className="flex items-baseline justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
              {data.verdict === "skip"
                ? "Technically visible"
                : "Visible tonight"}
            </h2>
            <span className="text-[13px] text-text-tertiary">
              Sorted by rarity
            </span>
          </motion.div>

          <div className="space-y-3">
            {data.objects.map((obj, i) => (
              <ObjectCard key={obj.id} object={obj} index={i} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        {data.upcoming.length > 0 && (
          <section className="px-4 mt-10 mb-8">
            <motion.h2
              className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              Worth planning for
            </motion.h2>

            <div className="space-y-3">
              {data.upcoming.map((event, i) => (
                <UpcomingCard key={event.name} event={event} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Scenario toggle — demo only */}
      <div className="fixed bottom-16 right-4 z-50">
        <button
          onClick={() => setScenario(scenario === "go" ? "skip" : "go")}
          className="px-3 py-1.5 rounded-full glass-elevated border border-border-strong text-[11px] font-medium text-text-secondary active:scale-95 transition-transform duration-100"
        >
          Demo: {scenario === "go" ? "Show skip" : "Show go"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

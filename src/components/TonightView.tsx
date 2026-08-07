"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TonightData } from "@/lib/types";
import { useSettings } from "@/lib/settings-context";
import { Verdict } from "./Verdict";
import { ConditionsStrip } from "./ConditionsStrip";
import { ObjectCard } from "./ObjectCard";
import { UpcomingCard } from "./UpcomingCard";
import { BottomNav } from "./BottomNav";
import { SettingsSheet } from "./SettingsSheet";

export function TonightView() {
  const { settings } = useSettings();
  const [data, setData] = useState<TonightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!settings.location) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tonight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: settings.location.lat,
          lng: settings.location.lng,
          equipment: settings.equipment,
          locationName: settings.location.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch sky data");
      const result: TonightData = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [settings.location, settings.equipment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-text-tertiary border-t-white mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[15px] text-text-secondary">
            Computing your sky...
          </p>
          <p className="text-[13px] text-text-tertiary mt-1">
            Calculating planet positions, checking weather
          </p>
        </motion.div>
        <BottomNav />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-24">
        <div className="text-center px-6">
          <p className="text-[17px] text-text-primary mb-2">
            Could not load sky data
          </p>
          <p className="text-[14px] text-text-secondary mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 rounded-full bg-white/10 text-[14px] font-medium text-text-primary active:scale-95 transition-transform duration-100"
          >
            Try again
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
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

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-text-tertiary tabular-nums">
              {data.date}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors active:scale-90 transition-transform duration-100"
              aria-label="Settings"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-text-secondary"
              >
                <path
                  d="M6.5 1.5H9.5L10 3.5L11.5 4.3L13.5 3.5L15 5.5L13.5 7L14 8.5V9.5L13.5 11L15 12.5L13.5 14.5L11.5 13.7L10 14.5L9.5 16.5H6.5L6 14.5L4.5 13.7L2.5 14.5L1 12.5L2.5 11L2 9.5V8.5L2.5 7L1 5.5L2.5 3.5L4.5 4.3L6 3.5L6.5 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto">
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

        <ConditionsStrip conditions={data.conditions} />

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
              <ObjectCard key={obj.id} object={obj} index={i} equipment={settings.equipment} />
            ))}
            {data.objects.length === 0 && (
              <p className="text-[14px] text-text-tertiary text-center py-8">
                No objects visible with your equipment right now.
              </p>
            )}
          </div>
        </section>

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

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BottomNav />
    </div>
  );
}

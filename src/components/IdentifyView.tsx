"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "./BottomNav";

interface IdentifyResult {
  confidence: number;
  name: string;
  type: string;
  explanation: string;
}

const mockResults: IdentifyResult[] = [
  {
    confidence: 94,
    name: "Starlink Group 15-2",
    type: "Satellite train",
    explanation:
      "A Starlink batch launched Tuesday passed over Ankara at 21:43, moving NW to SE. Matches your description: steady light, no blinking, ~4 minute duration. This was 22 satellites in a low-altitude train before they raise orbits and spread out.",
  },
  {
    confidence: 4,
    name: "ISS",
    type: "Space station",
    explanation:
      "The ISS was below the horizon from Ankara at that time. Unlikely match.",
  },
  {
    confidence: 2,
    name: "Aircraft",
    type: "Aviation",
    explanation:
      "Aircraft typically blink (red/green navigation lights). Your description of a steady, non-blinking light makes this unlikely.",
  },
];

export function IdentifyView() {
  const [description, setDescription] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = () => {
    if (description.trim().length > 10) {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <motion.header
        className="fixed top-0 inset-x-0 z-50 glass border-b border-border pt-[env(safe-area-inset-top)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        <div className="flex items-center justify-center h-11 px-5 max-w-lg mx-auto">
          <span className="text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
            What was that light?
          </span>
        </div>
      </motion.header>

      <div className="pt-20 px-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
                Describe what you saw — time, direction, how long it lasted,
                what it looked like. The more detail, the better the match.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.08em] text-text-tertiary mb-2">
                    What did you see?
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 rounded-2xl bg-white/[0.06] border border-border text-[15px] text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-accent/50 transition-colors duration-150"
                    placeholder={"Around 9:45pm, I saw a bright steady light moving from northwest to southeast. It lasted about 4 minutes, didn't blink, and was brighter than any star."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <motion.button
                  className="w-full py-3.5 rounded-2xl bg-accent text-white text-[15px] font-semibold tracking-[-0.01em] disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={description.trim().length <= 10}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.15 }}
                >
                  Identify
                </motion.button>
              </div>

              <div className="mt-10">
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary mb-4">
                  Common sightings
                </p>
                <div className="space-y-2">
                  {[
                    "Starlink satellite train — a line of steady dots",
                    "ISS pass — single bright steady light, 4-6 minutes",
                    "Iridium flare — brief bright flash, then gone",
                    "Meteor / fireball — fast streak, under 5 seconds",
                  ].map((hint) => (
                    <button
                      key={hint}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.04] border border-border text-[13px] text-text-secondary active:scale-[0.98] transition-transform duration-100"
                      onClick={() => setDescription(hint.split(" — ")[0])}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
                  Best matches
                </h2>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setDescription("");
                  }}
                  className="text-[13px] text-accent font-medium"
                >
                  New search
                </button>
              </div>

              <div className="space-y-3">
                {mockResults.map((result, i) => (
                  <motion.div
                    key={result.name}
                    className="rounded-[20px] glass border border-border p-5"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0,
                      duration: 0.4,
                      delay: i * 0.1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
                          {result.name}
                        </h3>
                        <p className="text-[13px] text-text-secondary mt-0.5">
                          {result.type}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[13px] font-bold tabular-nums ${
                          result.confidence > 80
                            ? "bg-[#30d158]/15 text-[#30d158]"
                            : result.confidence > 20
                              ? "bg-[#ff9f0a]/15 text-[#ff9f0a]"
                              : "bg-white/[0.06] text-text-tertiary"
                        }`}
                      >
                        {result.confidence}%
                      </div>
                    </div>
                    <p className="text-[14px] leading-relaxed text-text-secondary">
                      {result.explanation}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

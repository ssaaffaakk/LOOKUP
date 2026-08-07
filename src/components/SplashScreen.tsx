"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.6 };

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 500);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center px-8"
          exit={{ opacity: 0 }}
          transition={SPRING}
        >
          <motion.div
            className="flex flex-col items-center text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#0a84ff] to-[#30d158] flex items-center justify-center mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.7, delay: 0.1 }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="12" r="3" stroke="white" strokeWidth="2" fill="none" />
                <path
                  d="M16 4C11.58 4 8 7.58 8 12C8 18 16 28 16 28S24 18 24 12C24 7.58 20.42 4 16 4Z"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 6L8 3M21 6L24 3M16 4V1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            <motion.h1
              className="text-[34px] font-bold tracking-[-0.03em] text-text-primary mb-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.35 }}
            >
              LOOKUP
            </motion.h1>

            <motion.p
              className="text-[17px] text-text-secondary leading-relaxed mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.5 }}
            >
              Tonight&apos;s sky, honestly.
            </motion.p>

            <motion.p
              className="text-[15px] text-text-tertiary leading-relaxed mb-12"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.65 }}
            >
              800,000 alerts per night. We filter them down to
              what&apos;s actually worth seeing from your backyard
              with your equipment — or honestly tell you to stay inside.
            </motion.p>

            <motion.button
              className="w-full max-w-xs py-3.5 rounded-2xl bg-accent text-white text-[17px] font-semibold tracking-[-0.01em]"
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", bounce: 0, duration: 0.15 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleContinue}
            >
              Get started
            </motion.button>

            <motion.p
              className="mt-6 text-[11px] text-text-tertiary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Powered by Fink &amp; ALeRCE alert brokers + IBM watsonx
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

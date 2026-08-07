"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/lib/settings-context";
import { useRouter } from "next/navigation";
import type { Equipment } from "@/lib/types";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };

const equipmentLabels: Record<Equipment, string> = {
  "naked-eye": "Naked eye",
  binoculars: "Binoculars",
  "small-scope": "Small telescope (3-4 in)",
  "medium-scope": "Medium telescope (6-8 in)",
  "large-scope": "Large telescope (10+ in)",
};

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { settings, resetSettings } = useSettings();
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl glass-elevated border-t border-border px-6 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-6" />

            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-text-primary mb-6">
              Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[15px] text-text-primary font-medium">Equipment</p>
                  <p className="text-[13px] text-text-tertiary">
                    {equipmentLabels[settings.equipment]}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[15px] text-text-primary font-medium">Location</p>
                  <p className="text-[13px] text-text-tertiary">
                    {settings.location?.name ?? "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[15px] text-text-primary font-medium">Experience</p>
                  <p className="text-[13px] text-text-tertiary capitalize">
                    {settings.experienceLevel}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border my-2" />

              <motion.button
                className="w-full py-3 rounded-2xl bg-white/[0.06] border border-border text-[15px] font-medium text-text-secondary"
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                onClick={() => {
                  onClose();
                  router.push("/setup");
                }}
              >
                Change setup
              </motion.button>

              <motion.button
                className="w-full py-3 rounded-2xl text-[15px] font-medium text-[#ff453a]"
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                onClick={() => {
                  resetSettings();
                  onClose();
                  router.push("/setup");
                }}
              >
                Reset everything
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

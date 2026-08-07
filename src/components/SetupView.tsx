"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import type { Equipment, ExperienceLevel } from "@/lib/types";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.5 };

const equipmentOptions: { id: Equipment; label: string; desc: string; icon: string }[] = [
  { id: "naked-eye", label: "Naked eye", desc: "No equipment — just looking up", icon: "👁" },
  { id: "binoculars", label: "Binoculars", desc: "7x50 or similar handheld optics", icon: "🔭" },
  { id: "small-scope", label: "Small telescope", desc: "3-4 inch / 70-100mm aperture", icon: "🔭" },
  { id: "medium-scope", label: "Medium telescope", desc: "6-8 inch / 150-200mm aperture", icon: "🔭" },
  { id: "large-scope", label: "Large telescope", desc: "10+ inch / 250mm+ aperture", icon: "🔭" },
];

const experienceOptions: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: "beginner", label: "Just starting", desc: "New to stargazing — show me the highlights" },
  { id: "intermediate", label: "Some experience", desc: "I know the major constellations" },
  { id: "experienced", label: "Experienced", desc: "I know my way around the sky" },
];

function LocationStep({
  onDetect,
  detecting,
  locationName,
  error,
}: {
  onDetect: () => void;
  detecting: boolean;
  locationName: string | null;
  error: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-text-primary">
          Where are you?
        </h2>
        <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">
          We need your location to calculate what is visible from your sky tonight.
        </p>
      </div>

      <motion.button
        className="w-full py-4 rounded-2xl glass border border-border flex items-center justify-center gap-3"
        whileTap={{ scale: 0.97 }}
        transition={SPRING}
        onClick={onDetect}
        disabled={detecting}
      >
        {detecting ? (
          <motion.div
            className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2V5M10 15V18M2 10H5M15 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <span className="text-[15px] font-semibold text-accent">
          {detecting ? "Detecting..." : "Use my location"}
        </span>
      </motion.button>

      {locationName && (
        <motion.div
          className="text-center py-3 rounded-2xl glass border border-accent/20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
        >
          <p className="text-[13px] text-text-tertiary uppercase tracking-[0.08em] mb-1">
            Detected location
          </p>
          <p className="text-[17px] font-semibold text-text-primary">{locationName}</p>
        </motion.div>
      )}

      {error && (
        <motion.p
          className="text-[13px] text-[#ff453a] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function SetupView() {
  const router = useRouter();
  const { settings, setEquipment, setExperienceLevel, setLocation, completeSetup } = useSettings();
  const [step, setStep] = useState(0);
  const [detecting, setDetecting] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setDetecting(true);
    setLocError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
      );
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown";
      const country = data.address?.country || "";
      const name = country ? `${city}, ${country}` : city;

      setLocation({ name, lat: latitude, lng: longitude });
    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        setLocError("Location access denied. Please enable location in your browser settings.");
      } else {
        setLocError("Could not detect location. Please try again.");
      }
    } finally {
      setDetecting(false);
    }
  }, [setLocation]);

  const handleFinish = useCallback(() => {
    completeSetup();
    router.push("/");
  }, [completeSetup, router]);

  const canAdvance = [
    true,
    true,
    !!settings.location,
  ];

  const steps = [
    // Step 0: Equipment
    <div key="equipment" className="space-y-6">
      <div className="text-center">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-text-primary">
          What do you have?
        </h2>
        <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">
          We will only show objects your equipment can actually resolve.
        </p>
      </div>

      <div className="space-y-2">
        {equipmentOptions.map((opt) => (
          <motion.button
            key={opt.id}
            className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-colors duration-150 ${
              settings.equipment === opt.id
                ? "glass border-accent/40 bg-accent/[0.08]"
                : "glass border-border"
            }`}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.15 }}
            onClick={() => setEquipment(opt.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{opt.icon}</span>
              <div>
                <p className={`text-[15px] font-semibold ${
                  settings.equipment === opt.id ? "text-accent" : "text-text-primary"
                }`}>
                  {opt.label}
                </p>
                <p className="text-[13px] text-text-tertiary">{opt.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>,

    // Step 1: Experience
    <div key="experience" className="space-y-6">
      <div className="text-center">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-text-primary">
          How experienced are you?
        </h2>
        <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">
          This adjusts how much detail and jargon we use.
        </p>
      </div>

      <div className="space-y-2">
        {experienceOptions.map((opt) => (
          <motion.button
            key={opt.id}
            className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-colors duration-150 ${
              settings.experienceLevel === opt.id
                ? "glass border-accent/40 bg-accent/[0.08]"
                : "glass border-border"
            }`}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.15 }}
            onClick={() => setExperienceLevel(opt.id)}
          >
            <p className={`text-[15px] font-semibold ${
              settings.experienceLevel === opt.id ? "text-accent" : "text-text-primary"
            }`}>
              {opt.label}
            </p>
            <p className="text-[13px] text-text-tertiary">{opt.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>,

    // Step 2: Location
    <LocationStep
      key="location"
      onDetect={detectLocation}
      detecting={detecting}
      locationName={settings.location?.name ?? null}
      error={locError}
    />,
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress */}
      <div className="pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-1.5 px-6 pt-6 pb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-accent" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRING}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pb-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
          {step > 0 && (
            <motion.button
              className="px-6 py-3.5 rounded-2xl glass border border-border text-[15px] font-semibold text-text-secondary"
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", bounce: 0, duration: 0.15 }}
              onClick={() => setStep(step - 1)}
            >
              Back
            </motion.button>
          )}

          <motion.button
            className="flex-1 py-3.5 rounded-2xl bg-accent text-white text-[15px] font-semibold tracking-[-0.01em] disabled:opacity-30 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.15 }}
            disabled={!canAdvance[step]}
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                handleFinish();
              }
            }}
          >
            {step === steps.length - 1 ? "Start exploring" : "Continue"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

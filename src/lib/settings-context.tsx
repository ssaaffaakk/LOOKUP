"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserSettings, Equipment, ExperienceLevel } from "./types";

const STORAGE_KEY = "lookup-settings";

const defaultSettings: UserSettings = {
  equipment: "naked-eye",
  experienceLevel: "beginner",
  location: null,
  setupComplete: false,
};

function loadSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
}

interface SettingsContextValue {
  settings: UserSettings;
  setEquipment: (e: Equipment) => void;
  setExperienceLevel: (l: ExperienceLevel) => void;
  setLocation: (loc: UserSettings["location"]) => void;
  completeSetup: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: UserSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setEquipment = useCallback(
    (equipment: Equipment) => persist({ ...settings, equipment }),
    [settings, persist],
  );
  const setExperienceLevel = useCallback(
    (experienceLevel: ExperienceLevel) => persist({ ...settings, experienceLevel }),
    [settings, persist],
  );
  const setLocation = useCallback(
    (location: UserSettings["location"]) => persist({ ...settings, location }),
    [settings, persist],
  );
  const completeSetup = useCallback(
    () => persist({ ...settings, setupComplete: true }),
    [settings, persist],
  );
  const resetSettings = useCallback(
    () => persist(defaultSettings),
    [persist],
  );

  if (!hydrated) return null;

  return (
    <SettingsContext.Provider
      value={{ settings, setEquipment, setExperienceLevel, setLocation, completeSetup, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

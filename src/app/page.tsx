"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import { TonightView } from "@/components/TonightView";

export default function Home() {
  const router = useRouter();
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.setupComplete) {
      router.replace("/setup");
    }
  }, [settings.setupComplete, router]);

  if (!settings.setupComplete) return null;

  return <TonightView />;
}

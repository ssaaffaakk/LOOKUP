import { NextRequest, NextResponse } from "next/server";
import { tonightGo, tonightSkip } from "@/lib/mock-data";
import type { TonightData, Equipment } from "@/lib/types";

interface TonightRequest {
  lat: number;
  lng: number;
  equipment: Equipment;
  locationName?: string;
}

function filterByEquipment(data: TonightData, equipment: Equipment): TonightData {
  const apertureThreshold: Record<Equipment, number> = {
    "naked-eye": 0,
    binoculars: 50,
    "small-scope": 100,
    "medium-scope": 200,
    "large-scope": 250,
  };

  const maxAperture = apertureThreshold[equipment];

  const filtered = data.objects.filter((obj) => {
    if (obj.minimumAperture.toLowerCase().includes("naked eye")) return true;
    if (obj.minimumAperture.toLowerCase().includes("binocular") && maxAperture >= 50)
      return true;
    const match = obj.minimumAperture.match(/(\d+)-?inch/i);
    if (match) {
      const needed = parseInt(match[1], 10) * 25.4;
      return maxAperture >= needed;
    }
    return maxAperture >= 50;
  });

  const canSeeAnything = filtered.some(
    (o) => o.rarity !== "common" || o.magnitude < 2,
  );

  return {
    ...data,
    objects: filtered,
    verdict: canSeeAnything ? data.verdict : "skip",
    verdictReason: canSeeAnything
      ? data.verdictReason
      : "Nothing remarkable visible with your current equipment tonight.",
  };
}

export async function POST(request: NextRequest) {
  const body: TonightRequest = await request.json();

  const baseData = tonightGo;

  const result = filterByEquipment(
    {
      ...baseData,
      location: {
        name: body.locationName ?? baseData.location.name,
        lat: body.lat,
        lng: body.lng,
      },
    },
    body.equipment,
  );

  return NextResponse.json(result);
}

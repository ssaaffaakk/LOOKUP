import { NextRequest, NextResponse } from "next/server";
import { buildTonightData } from "@/lib/sky-engine";
import type { Equipment } from "@/lib/types";

interface TonightRequest {
  lat: number;
  lng: number;
  equipment: Equipment;
  locationName?: string;
}

export async function POST(request: NextRequest) {
  const body: TonightRequest = await request.json();

  const data = await buildTonightData(
    body.lat,
    body.lng,
    body.locationName ?? "Unknown",
    body.equipment,
  );

  return NextResponse.json(data);
}

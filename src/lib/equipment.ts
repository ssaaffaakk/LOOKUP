import type { Equipment } from "./types";

const apertureMap: Record<Equipment, number> = {
  "naked-eye": 0,
  binoculars: 50,
  "small-scope": 100,
  "medium-scope": 200,
  "large-scope": 254,
};

export function canSeeWith(minimumAperture: string, equipment: Equipment): boolean {
  const maxMm = apertureMap[equipment];
  const lower = minimumAperture.toLowerCase();

  if (lower.includes("naked eye")) return true;
  if (lower.includes("binocular")) return maxMm >= 50;

  const inchMatch = lower.match(/(\d+)-?inch/i);
  if (inchMatch) {
    const neededMm = parseInt(inchMatch[1], 10) * 25.4;
    return maxMm >= neededMm;
  }

  return maxMm >= 50;
}

export function equipmentVerdict(
  minimumAperture: string,
  equipment: Equipment,
): { canSee: boolean; message: string } {
  if (canSeeWith(minimumAperture, equipment)) {
    return { canSee: true, message: `Visible with your ${equipmentLabel(equipment)}` };
  }

  return {
    canSee: false,
    message: `Needs ${minimumAperture}`,
  };
}

function equipmentLabel(equipment: Equipment): string {
  switch (equipment) {
    case "naked-eye": return "eyes";
    case "binoculars": return "binoculars";
    case "small-scope": return "scope";
    case "medium-scope": return "scope";
    case "large-scope": return "scope";
  }
}

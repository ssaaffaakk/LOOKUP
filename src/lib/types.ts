export type Rarity =
  | "common"
  | "notable"
  | "rare"
  | "extraordinary"
  | "legendary";

export type ObjectType =
  | "supernova"
  | "nova"
  | "comet"
  | "planet"
  | "deep-sky"
  | "meteor-shower"
  | "satellite"
  | "aurora"
  | "asteroid";

export type Verdict = "go" | "marginal" | "skip";

export interface SkyConditions {
  cloudCover: number;
  moonPhase: number;
  moonAltitude: number;
  seeing: number;
  transparency: number;
  bortle: number;
  temperature: number;
  humidity: number;
  sunset: string;
  astronomicalTwilight: string;
  sunrise: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  type: ObjectType;
  rarity: Rarity;
  magnitude: number;
  constellation: string;
  altitude: number;
  azimuth: number;
  bestTime: string;
  setTime?: string;
  riseTime?: string;
  minimumAperture: string;
  whatYoullSee: string;
  whyItMatters: string;
  rarityExplanation: string;
  isTransient: boolean;
  daysLeft?: number;
}

export interface UpcomingEvent {
  date: string;
  name: string;
  description: string;
  rarity: Rarity;
}

export interface TonightData {
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  date: string;
  localTime: string;
  verdict: Verdict;
  verdictReason: string;
  verdictDetail: string;
  conditions: SkyConditions;
  objects: CelestialObject[];
  upcoming: UpcomingEvent[];
}

export type Equipment = "naked-eye" | "binoculars" | "small-scope" | "medium-scope" | "large-scope";

export type ExperienceLevel = "beginner" | "intermediate" | "experienced";

export interface UserSettings {
  equipment: Equipment;
  experienceLevel: ExperienceLevel;
  location: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  setupComplete: boolean;
}

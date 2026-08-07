import { TonightData } from "./types";

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const tonightGo: TonightData = {
  location: { name: "Ankara, Turkey", lat: 39.9334, lng: 32.8597 },
  date: todayFormatted(),
  localTime: "21:34",
  verdict: "go",
  verdictReason: "SN 2026sqf is visible tonight.",
  verdictDetail:
    "The only supernova an amateur can see this entire year is above your horizon right now. Magnitude 11.5 in NGC 3310 — you need at least a 6-inch scope, but it's there. Clouds are low, moon sets at 00:40. Your window opens after astronomical twilight at 21:45.",
  conditions: {
    cloudCover: 12,
    moonPhase: 42,
    moonAltitude: 28,
    seeing: 7,
    transparency: 8,
    bortle: 6,
    temperature: 24,
    humidity: 35,
    sunset: "20:12",
    astronomicalTwilight: "21:45",
    sunrise: "06:01",
  },
  objects: [
    {
      id: "sn2026sqf",
      name: "SN 2026sqf",
      type: "supernova",
      rarity: "rare",
      magnitude: 11.5,
      constellation: "Ursa Major",
      altitude: 34,
      azimuth: 315,
      bestTime: "23:15",
      setTime: "03:42",
      minimumAperture: "6-inch telescope",
      whatYoullSee:
        "A faint point of light near the core of NGC 3310. Not dramatic — a dot that wasn't there six months ago. That dot is a star that exploded 50 million years ago.",
      whyItMatters:
        "In all of 2026, across 800,000 alerts per night from the largest telescope ever built, this is the only supernova bright enough for an amateur to see. The next one on the list is magnitude 15.0 — 25 times fainter.",
      rarityExplanation:
        "One amateur-visible supernova per year on average. Last comparable: SN 2023ixf in M101.",
      isTransient: true,
      daysLeft: Math.max(1, Math.ceil((new Date("2026-09-14").getTime() - Date.now()) / 86400000)),
    },
    {
      id: "saturn",
      name: "Saturn",
      type: "planet",
      rarity: "common",
      magnitude: 0.5,
      constellation: "Aquarius",
      altitude: 22,
      azimuth: 135,
      bestTime: "01:30",
      riseTime: "21:18",
      minimumAperture: "Naked eye (rings need 4-inch)",
      whatYoullSee:
        "A steady, pale gold dot. With a 4-inch scope at 100x, you'll resolve the rings — they're at 13 degrees tilt, still visible but closing. The Cassini Division might be tricky tonight.",
      whyItMatters:
        "Opposition is August 27 — Saturn is getting brighter every night. Best views of the year are in the next three weeks.",
      rarityExplanation: "Visible for months, but opposition brightness is annual.",
      isTransient: false,
    },
    {
      id: "iss-pass",
      name: "ISS Pass",
      type: "satellite",
      rarity: "common",
      magnitude: -3.8,
      constellation: "crossing Cygnus",
      altitude: 67,
      azimuth: 220,
      bestTime: "22:12",
      minimumAperture: "Naked eye",
      whatYoullSee:
        "A bright, steady light moving smoothly from northwest to southeast. Takes about 4 minutes to cross the sky. Brighter than any star — you can't miss it.",
      whyItMatters:
        "Six humans are living up there right now, moving at 28,000 km/h, 420 km above you.",
      rarityExplanation:
        "Visible passes happen several times per week, but this one is bright and high.",
      isTransient: false,
    },
    {
      id: "m13",
      name: "M13 — Hercules Cluster",
      type: "deep-sky",
      rarity: "common",
      magnitude: 5.8,
      constellation: "Hercules",
      altitude: 71,
      azimuth: 245,
      bestTime: "22:30",
      setTime: "04:15",
      minimumAperture: "Binoculars (detail needs 6-inch)",
      whatYoullSee:
        "Through binoculars: a fuzzy ball, like a star that won't focus. Through a 6-inch scope at 150x: individual stars start to resolve at the edges. It's 300,000 stars in a ball 145 light-years across.",
      whyItMatters:
        "The best globular cluster in the northern sky. If you're learning to find deep-sky objects, start here — it's bright enough to survive light pollution.",
      rarityExplanation: "Visible every summer from northern latitudes.",
      isTransient: false,
    },
    {
      id: "jupiter",
      name: "Jupiter",
      type: "planet",
      rarity: "common",
      magnitude: -2.2,
      constellation: "Taurus",
      altitude: 15,
      azimuth: 78,
      bestTime: "04:30",
      riseTime: "02:45",
      minimumAperture: "Naked eye (detail needs 4-inch)",
      whatYoullSee:
        "Rises late and stays low tonight. Brilliant white dot, clearly brighter than anything else in the east. Through a scope: two main cloud bands and up to four moons in a line.",
      whyItMatters:
        "Low altitude means atmosphere distortion — better views coming in autumn when it rises earlier and climbs higher.",
      rarityExplanation: "Visible most of the year. Low in the sky tonight.",
      isTransient: false,
    },
  ],
  upcoming: [
    {
      date: "12-13 Aug",
      name: "Perseid Meteor Shower",
      description:
        "Best shower of 2026. Up to 100/hour from a dark site. Moon sets at 00:30 — prime time is after midnight.",
      rarity: "notable",
    },
    {
      date: "27 Aug",
      name: "Saturn at Opposition",
      description:
        "Closest and brightest Saturn of the year. Rings at 13 degrees tilt — still visible, but closing year by year.",
      rarity: "notable",
    },
  ],
};

export const tonightSkip: TonightData = {
  location: { name: "Ankara, Turkey", lat: 39.9334, lng: 32.8597 },
  date: todayFormatted(),
  localTime: "21:15",
  verdict: "skip",
  verdictReason: "Not worth it tonight.",
  verdictDetail:
    "Clouds at 72%, and the moon is nearly full at 89% — it won't set until 03:15. Even if the clouds break, the moonlight will wash out anything fainter than magnitude 4. Nothing rare is up. Save your energy.",
  conditions: {
    cloudCover: 72,
    moonPhase: 89,
    moonAltitude: 52,
    seeing: 4,
    transparency: 3,
    bortle: 6,
    temperature: 22,
    humidity: 68,
    sunset: "20:10",
    astronomicalTwilight: "21:43",
    sunrise: "06:03",
  },
  objects: [
    {
      id: "saturn-skip",
      name: "Saturn",
      type: "planet",
      rarity: "common",
      magnitude: 0.5,
      constellation: "Aquarius",
      altitude: 18,
      azimuth: 140,
      bestTime: "01:30",
      riseTime: "21:16",
      minimumAperture: "Naked eye",
      whatYoullSee:
        "Technically visible, but moonlight and clouds will make it a dim, unsteady dot. Not worth setting up a scope for tonight.",
      whyItMatters: "Wait for opposition on August 27 — and a clear night.",
      rarityExplanation: "Visible for months. Tonight is poor conditions.",
      isTransient: false,
    },
  ],
  upcoming: [
    {
      date: "12-13 Aug",
      name: "Perseid Meteor Shower",
      description:
        "Best shower of 2026. Worth planning for — set an alarm. Check back here for the forecast.",
      rarity: "notable",
    },
    {
      date: "27 Aug",
      name: "Saturn at Opposition",
      description:
        "Best Saturn of 2026. Mark it.",
      rarity: "notable",
    },
  ],
};

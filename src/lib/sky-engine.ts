import * as Astronomy from "astronomy-engine";
import type {
  CelestialObject,
  SkyConditions,
  Verdict,
  TonightData,
  UpcomingEvent,
  Equipment,
} from "./types";

function makeDate(d?: Date): Astronomy.FlexibleDateTime {
  return d ?? new Date();
}

function altAz(
  body: Astronomy.Body,
  lat: number,
  lng: number,
  date?: Date,
): { altitude: number; azimuth: number } {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const equatorial = Astronomy.Equator(body, makeDate(date), observer, true, true);
  const horizon = Astronomy.Horizon(makeDate(date), observer, equatorial.ra, equatorial.dec, "normal");
  return { altitude: horizon.altitude, azimuth: horizon.azimuth };
}

function riseSetTransit(
  body: Astronomy.Body,
  lat: number,
  lng: number,
  date?: Date,
): { rise?: string; set?: string; transit?: string } {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const d = date ?? new Date();
  const result: { rise?: string; set?: string; transit?: string } = {};

  try {
    const rise = Astronomy.SearchRiseSet(body, observer, +1, makeDate(d), 1);
    if (rise) result.rise = new Date(rise.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {}

  try {
    const set = Astronomy.SearchRiseSet(body, observer, -1, makeDate(d), 1);
    if (set) result.set = new Date(set.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {}

  return result;
}

function moonPhasePercent(date?: Date): number {
  const phase = Astronomy.MoonPhase(makeDate(date ?? new Date()));
  if (phase <= 180) return (phase / 180) * 100;
  return ((360 - phase) / 180) * 100;
}

function sunTimes(
  lat: number,
  lng: number,
  date?: Date,
): { sunset: string; sunrise: string; twilight: string } {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const d = date ?? new Date();

  let sunset = "N/A";
  let sunrise = "N/A";
  let twilight = "N/A";

  try {
    const ss = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, makeDate(d), 1);
    if (ss) sunset = new Date(ss.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {}

  try {
    const sr = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, makeDate(d), 1);
    if (sr) sunrise = new Date(sr.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {}

  try {
    const ss = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, makeDate(d), 1);
    if (ss) {
      const twilightDate = new Date(ss.date.getTime() + 90 * 60 * 1000);
      twilight = twilightDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
  } catch {}

  return { sunset, sunrise, twilight };
}

function magnitudeLabel(body: Astronomy.Body, date?: Date): number {
  try {
    const illum = Astronomy.Illumination(body, makeDate(date ?? new Date()));
    return Math.round(illum.mag * 10) / 10;
  } catch {
    return 99;
  }
}

function constellationOf(body: Astronomy.Body, date?: Date): string {
  try {
    const observer = new Astronomy.Observer(0, 0, 0);
    const eq = Astronomy.Equator(body, makeDate(date ?? new Date()), observer, true, true);
    const constel = Astronomy.Constellation(eq.ra, eq.dec);
    return constel.name;
  } catch {
    return "Unknown";
  }
}

const PLANET_MAP: { body: Astronomy.Body; name: string }[] = [
  { body: Astronomy.Body.Mercury, name: "Mercury" },
  { body: Astronomy.Body.Venus, name: "Venus" },
  { body: Astronomy.Body.Mars, name: "Mars" },
  { body: Astronomy.Body.Jupiter, name: "Jupiter" },
  { body: Astronomy.Body.Saturn, name: "Saturn" },
];

const PLANET_DESCRIPTIONS: Record<string, { see: string; why: string }> = {
  Mercury: {
    see: "A faint dot near the horizon, visible briefly after sunset or before sunrise. Hard to catch — it never strays far from the sun.",
    why: "The closest planet to the sun. Seeing it requires good timing and a clear horizon.",
  },
  Venus: {
    see: "The brightest object in the sky after the sun and moon. Unmistakable near the horizon — sometimes called the 'evening star' or 'morning star'.",
    why: "So bright it's often reported as a UFO. With a telescope you can see its phases like a tiny moon.",
  },
  Mars: {
    see: "A distinctly orange-red dot. With a telescope you might glimpse dark surface markings when it's close to Earth.",
    why: "The next planet out from us. Its brightness varies dramatically depending on where it is in its orbit.",
  },
  Jupiter: {
    see: "Very bright, steady light. With binoculars you can see up to 4 tiny dots in a line — the Galilean moons. A telescope shows cloud bands.",
    why: "The largest planet. Its moons were the first objects Galileo saw that clearly orbited something other than Earth.",
  },
  Saturn: {
    see: "A steady, yellowish light. With a small telescope the rings are clearly visible — one of the most rewarding sights in amateur astronomy.",
    why: "The rings are unmistakable even in a small telescope. Nothing else in the sky looks like this.",
  },
};

const MESSIER_OBJECTS: {
  id: string;
  name: string;
  ra: number;
  dec: number;
  mag: number;
  type: string;
  constellation: string;
  aperture: string;
  see: string;
  why: string;
}[] = [
  {
    id: "m13",
    name: "M13 — Hercules Cluster",
    ra: 16.6948,
    dec: 36.4613,
    mag: 5.8,
    type: "deep-sky",
    constellation: "Hercules",
    aperture: "Binoculars (detail needs 6-inch)",
    see: "A fuzzy ball of light in binoculars. A telescope resolves it into thousands of individual stars packed into a sphere.",
    why: "One of the best globular clusters in the northern sky. 300,000 stars, 25,000 light-years away.",
  },
  {
    id: "m31",
    name: "M31 — Andromeda Galaxy",
    ra: 0.7123,
    dec: 41.2689,
    mag: 3.4,
    type: "deep-sky",
    constellation: "Andromeda",
    aperture: "Naked eye (detail needs binoculars)",
    see: "A faint, elongated smudge visible to the naked eye from dark sites. Binoculars reveal its full extent — wider than the full moon.",
    why: "The most distant object visible to the naked eye at 2.5 million light-years. Our galaxy's nearest large neighbor.",
  },
  {
    id: "m42",
    name: "M42 — Orion Nebula",
    ra: 5.5881,
    dec: -5.3911,
    mag: 4.0,
    type: "deep-sky",
    constellation: "Orion",
    aperture: "Naked eye (detail needs 4-inch)",
    see: "A glowing cloud in Orion's sword. Even binoculars reveal structure. A telescope shows swirls of gas and the Trapezium star cluster at its heart.",
    why: "The closest massive star-forming region to Earth. New solar systems are being born inside this cloud right now.",
  },
  {
    id: "m45",
    name: "M45 — Pleiades",
    ra: 3.7871,
    dec: 24.1167,
    mag: 1.6,
    type: "deep-sky",
    constellation: "Taurus",
    aperture: "Naked eye",
    see: "A tight cluster of 6-7 bright blue stars, sometimes called the Seven Sisters. Best in binoculars — a telescope field of view is too narrow.",
    why: "One of the closest star clusters to Earth. Known to every ancient civilization — they appear in myths worldwide.",
  },
  {
    id: "m57",
    name: "M57 — Ring Nebula",
    ra: 18.8933,
    dec: 33.0286,
    mag: 8.8,
    type: "deep-sky",
    constellation: "Lyra",
    aperture: "4-inch telescope",
    see: "A tiny, ghostly smoke ring. Higher magnification reveals its ring structure — the remnant of a star that died thousands of years ago.",
    why: "A planetary nebula — what our sun will look like in 5 billion years. The star at the center is a white dwarf.",
  },
  {
    id: "m51",
    name: "M51 — Whirlpool Galaxy",
    ra: 13.4987,
    dec: 47.1952,
    mag: 8.4,
    type: "deep-sky",
    constellation: "Canes Venatici",
    aperture: "6-inch telescope",
    see: "Two fuzzy patches close together. A larger telescope reveals spiral arms — one of the few galaxies where you can see spiral structure visually.",
    why: "A face-on spiral galaxy interacting with a smaller companion. 23 million light-years away.",
  },
];

function deepSkyObjects(
  lat: number,
  lng: number,
  date?: Date,
): CelestialObject[] {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const d = date ?? new Date();
  const results: CelestialObject[] = [];

  for (const obj of MESSIER_OBJECTS) {
    const horizon = Astronomy.Horizon(makeDate(d), observer, obj.ra, obj.dec, "normal");

    if (horizon.altitude < 15) continue;

    const fourHoursLater = new Date(d.getTime() + 4 * 3600000);
    const horizonLater = Astronomy.Horizon(makeDate(fourHoursLater), observer, obj.ra, obj.dec, "normal");
    const bestAlt = Math.max(horizon.altitude, horizonLater.altitude);
    const bestTime = bestAlt === horizon.altitude ? d : fourHoursLater;

    results.push({
      id: obj.id,
      name: obj.name,
      type: "deep-sky",
      rarity: "common",
      magnitude: obj.mag,
      constellation: obj.constellation,
      altitude: Math.round(horizon.altitude),
      azimuth: Math.round(horizon.azimuth),
      bestTime: bestTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      minimumAperture: obj.aperture,
      whatYoullSee: obj.see,
      whyItMatters: obj.why,
      rarityExplanation: "Visible most clear nights from suitable latitudes.",
      isTransient: false,
    });
  }

  return results;
}

export function computePlanets(
  lat: number,
  lng: number,
  date?: Date,
): CelestialObject[] {
  const d = date ?? new Date();
  const results: CelestialObject[] = [];

  for (const planet of PLANET_MAP) {
    const pos = altAz(planet.body, lat, lng, d);
    if (pos.altitude < -5) continue;

    const mag = magnitudeLabel(planet.body, d);
    if (mag > 6) continue;

    const constellation = constellationOf(planet.body, d);
    const times = riseSetTransit(planet.body, lat, lng, d);
    const desc = PLANET_DESCRIPTIONS[planet.name] ?? { see: "", why: "" };

    let bestTime = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (pos.altitude < 0 && times.rise) {
      bestTime = times.rise;
    }

    results.push({
      id: planet.name.toLowerCase(),
      name: planet.name,
      type: "planet",
      rarity: "common",
      magnitude: mag,
      constellation,
      altitude: Math.round(pos.altitude),
      azimuth: Math.round(pos.azimuth),
      bestTime,
      riseTime: times.rise,
      setTime: times.set,
      minimumAperture:
        planet.name === "Venus" || planet.name === "Jupiter" || planet.name === "Mars"
          ? "Naked eye (detail needs 4-inch)"
          : planet.name === "Saturn"
            ? "Naked eye (rings need 4-inch)"
            : "Naked eye",
      whatYoullSee: desc.see,
      whyItMatters: desc.why,
      rarityExplanation: "Visible regularly but position changes throughout the year.",
      isTransient: false,
    });
  }

  return results;
}

export function computeMoonAndSun(
  lat: number,
  lng: number,
  date?: Date,
): {
  moonPhase: number;
  moonAltitude: number;
  sunset: string;
  sunrise: string;
  twilight: string;
} {
  const d = date ?? new Date();
  const moonPos = altAz(Astronomy.Body.Moon, lat, lng, d);
  const sun = sunTimes(lat, lng, d);

  return {
    moonPhase: Math.round(moonPhasePercent(d)),
    moonAltitude: Math.round(moonPos.altitude),
    sunset: sun.sunset,
    sunrise: sun.sunrise,
    twilight: sun.twilight,
  };
}

export async function fetchWeather(
  lat: number,
  lng: number,
): Promise<{ cloudCover: number; temperature: number; humidity: number; seeing: number; windSpeed: number }> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=cloud_cover,temperature_2m,relative_humidity_2m,wind_speed_10m`,
    );
    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();

    const clouds = data.current?.cloud_cover ?? 20;
    const temp = Math.round(data.current?.temperature_2m ?? 22);
    const humid = data.current?.relative_humidity_2m ?? 40;
    const wind = data.current?.wind_speed_10m ?? 5;

    let seeing = 7;
    if (clouds > 60) seeing = 3;
    else if (clouds > 30) seeing = 5;
    else if (humid > 80) seeing = 4;
    else if (wind > 30) seeing = 4;
    else if (humid < 50 && wind < 15) seeing = 8;

    return { cloudCover: clouds, temperature: temp, humidity: humid, seeing, windSpeed: wind };
  } catch {
    return { cloudCover: 20, temperature: 22, humidity: 40, seeing: 6, windSpeed: 5 };
  }
}

export function estimateBortle(lat: number, lng: number): number {
  const absLat = Math.abs(lat);
  if (absLat > 60) return 3;
  if (absLat > 45) return 5;
  return 6;
}

export function computeVerdict(
  conditions: SkyConditions,
  objects: CelestialObject[],
  equipment: Equipment,
): { verdict: Verdict; reason: string; detail: string } {
  const hasRare = objects.some((o) => o.rarity === "rare" || o.rarity === "extraordinary" || o.rarity === "legendary");
  const badWeather = conditions.cloudCover > 70;
  const highMoon = conditions.moonPhase > 80;

  if (badWeather) {
    return {
      verdict: "skip",
      reason: "Too cloudy tonight.",
      detail: `Cloud cover is ${conditions.cloudCover}%. Not worth setting up — you will not see much through the gaps. Save your energy for a clear night.`,
    };
  }

  if (conditions.cloudCover > 50 && !hasRare) {
    return {
      verdict: "marginal",
      reason: "Partly cloudy, limited targets.",
      detail: `Cloud cover around ${conditions.cloudCover}%. Bright planets should punch through, but deep sky objects will be washed out. Moon is ${conditions.moonPhase}% illuminated.`,
    };
  }

  if (hasRare) {
    const rare = objects.find((o) => o.rarity === "rare" || o.rarity === "extraordinary");
    return {
      verdict: "go",
      reason: `${rare?.name} is visible tonight.`,
      detail: `Clear skies with ${conditions.cloudCover}% clouds. ${rare?.name} is above your horizon — a ${rare?.rarity} event. Moon sets and conditions improve after ${conditions.astronomicalTwilight}.`,
    };
  }

  const visibleCount = objects.filter((o) => o.altitude > 10).length;
  if (visibleCount >= 3 && conditions.cloudCover < 30) {
    return {
      verdict: "go",
      reason: "Clear skies, good targets.",
      detail: `${visibleCount} objects visible tonight with ${conditions.cloudCover}% cloud cover. Moon is ${conditions.moonPhase}% illuminated. Best viewing after ${conditions.astronomicalTwilight}.`,
    };
  }

  return {
    verdict: "marginal",
    reason: "A few things worth seeing.",
    detail: `${visibleCount} objects above the horizon. Conditions are fair — ${conditions.cloudCover}% clouds, moon at ${conditions.moonPhase}%. Not the best night, but not the worst.`,
  };
}

export function computeUpcoming(lat: number, lng: number): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  const upcoming = [
    {
      date: new Date(currentYear, 7, 12),
      name: "Perseid Meteor Shower",
      description: `Best meteor shower of ${currentYear}. Up to 100 meteors/hour from a dark site. Best viewed after midnight when the radiant is high.`,
      rarity: "notable" as const,
    },
    {
      date: new Date(currentYear, 7, 27),
      name: "Saturn at Opposition",
      description: "Saturn at its closest and brightest. Rings visible in any telescope. Best planet viewing of the year.",
      rarity: "notable" as const,
    },
    {
      date: new Date(currentYear, 11, 14),
      name: "Geminid Meteor Shower",
      description: "Often the best shower of the year — up to 150/hour. Geminids are slower and brighter than Perseids.",
      rarity: "notable" as const,
    },
    {
      date: new Date(currentYear, 9, 21),
      name: "Orionid Meteor Shower",
      description: "Debris from Halley's Comet. 20-25 meteors/hour. Fast meteors that sometimes leave persistent trains.",
      rarity: "common" as const,
    },
  ];

  for (const event of upcoming) {
    const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / 86400000);
    if (daysUntil > 0 && daysUntil < 90) {
      const dateStr = event.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      events.push({
        date: dateStr,
        name: event.name,
        description: event.description,
        rarity: event.rarity,
      });
    }
  }

  return events.slice(0, 3);
}

export async function fetchISS(
  lat: number,
  lng: number,
): Promise<CelestialObject[]> {
  const apiKey = process.env.N2YO_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/${lat}/${lng}/0/2/300/&apiKey=${apiKey}`,
    );
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.passes || data.passes.length === 0) return [];

    return data.passes.slice(0, 2).map((pass: {
      startUTC: number;
      startAz: number;
      startEl: number;
      maxEl: number;
      maxAz: number;
      mag: number;
      duration: number;
    }, i: number) => {
      const startDate = new Date(pass.startUTC * 1000);
      const bestTime = startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const mag = pass.mag ?? -2.0;
      const duration = Math.round((pass.duration ?? 300) / 60);

      return {
        id: `iss-pass-${i}`,
        name: "ISS Pass",
        type: "satellite" as const,
        rarity: "common" as const,
        magnitude: mag,
        constellation: `${Math.round(pass.maxEl)}° max elevation`,
        altitude: Math.round(pass.startEl ?? pass.maxEl ?? 30),
        azimuth: Math.round(pass.startAz ?? 0),
        bestTime,
        minimumAperture: "Naked eye",
        whatYoullSee: `A bright, steady light moving smoothly across the sky. Takes about ${duration} minutes to cross. Brighter than any star.`,
        whyItMatters: "The International Space Station — humans living in orbit at 28,000 km/h, 420 km above you.",
        rarityExplanation: "Visible passes happen several times per week, but brightness varies.",
        isTransient: false,
      } satisfies CelestialObject;
    });
  } catch {
    return [];
  }
}

async function fetchALeRCE(
  lat: number,
  lng: number,
): Promise<CelestialObject[]> {
  try {
    const res = await fetch(
      "https://api.alerce.online/ztf/v1/objects/?classifier=stamp_classifier&class=SN&probability=0.5&page_size=10&order_by=firstmjd&order_mode=DESC",
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    const observer = new Astronomy.Observer(lat, lng, 0);
    const now = new Date();
    const results: CelestialObject[] = [];

    for (const item of data.items) {
      const raDeg = item.meanra ?? 0;
      const decDeg = item.meandec ?? 0;
      if (raDeg === 0 && decDeg === 0) continue;

      const raHours = raDeg / 15;
      const horizon = Astronomy.Horizon(makeDate(now), observer, raHours, decDeg, "normal");

      let constellationName = "Unknown";
      try {
        const constel = Astronomy.Constellation(raHours, decDeg);
        constellationName = constel.name;
      } catch {}

      const prob = item.probability ?? 0.5;
      const oid = item.oid ?? "unknown";

      results.push({
        id: `alerce-${oid}`,
        name: `SN candidate ${oid}`,
        type: "supernova",
        rarity: prob > 0.8 ? "rare" as const : "notable" as const,
        magnitude: 16,
        constellation: constellationName,
        altitude: Math.round(horizon.altitude),
        azimuth: Math.round(horizon.azimuth),
        bestTime: horizon.altitude > 0
          ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : "below horizon",
        minimumAperture: "8-inch telescope",
        whatYoullSee: `A faint point in ${constellationName}. Classified as a supernova candidate with ${Math.round(prob * 100)}% confidence by machine learning.`,
        whyItMatters: `Real alert from ALeRCE broker processing ZTF sky survey data. ${prob > 0.7 ? "High-confidence supernova candidate — a star that exploded in a distant galaxy." : "Under investigation by automated classifiers."}`,
        rarityExplanation: "Flagged by ALeRCE machine learning classifiers scanning millions of sources nightly.",
        isTransient: true,
        daysLeft: 30,
      });
    }

    return results.filter((t) => t.altitude > -10).slice(0, 3);
  } catch {
    return [];
  }
}

export async function fetchTransients(
  lat: number,
  lng: number,
): Promise<CelestialObject[]> {
  try {
    const res = await fetch(
      "https://fink-portal.org/api/v1/latests?class=SN%20candidate&n=20&columns=i:objectId,i:ra,i:dec,i:magpsf,d:rf_snia_vs_nonia,i:jdstarthist&output-format=json",
    );
    if (!res.ok) {
      return fetchALeRCE(lat, lng);
    }

    const alerts = await res.json();
    if (!Array.isArray(alerts) || alerts.length === 0) return [];

    const observer = new Astronomy.Observer(lat, lng, 0);
    const now = new Date();
    const transients: CelestialObject[] = [];

    for (const alert of alerts) {
      const mag = parseFloat(alert["i:magpsf"] ?? "99");
      if (mag > 18 || isNaN(mag)) continue;

      const raDeg = parseFloat(alert["i:ra"] ?? "0");
      const decDeg = parseFloat(alert["i:dec"] ?? "0");
      if (raDeg === 0 && decDeg === 0) continue;

      const raHours = raDeg / 15;
      const horizon = Astronomy.Horizon(makeDate(now), observer, raHours, decDeg, "normal");

      let constellationName = "Unknown";
      try {
        const constel = Astronomy.Constellation(raHours, decDeg);
        constellationName = constel.name;
      } catch {}

      const snia = parseFloat(alert["d:rf_snia_vs_nonia"] ?? "0");
      const objectId = alert["i:objectId"] ?? "unknown";

      const jdStart = parseFloat(alert["i:jdstarthist"] ?? "0");
      const discovDate = jdStart > 0 ? new Date((jdStart - 2440587.5) * 86400000) : null;
      const daysLeft = discovDate
        ? Math.max(1, Math.ceil((discovDate.getTime() + 90 * 86400000 - Date.now()) / 86400000))
        : 30;

      const bestTime = horizon.altitude > 0
        ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        : "below horizon";

      const rarity = snia > 0.8 ? "rare" as const : mag < 15 ? "notable" as const : "common" as const;

      transients.push({
        id: `fink-${objectId}`,
        name: snia > 0.5 ? `SN candidate ${objectId}` : `Transient ${objectId}`,
        type: "supernova",
        rarity,
        magnitude: Math.round(mag * 10) / 10,
        constellation: constellationName,
        altitude: Math.round(horizon.altitude),
        azimuth: Math.round(horizon.azimuth),
        bestTime,
        minimumAperture: mag < 10 ? "Binoculars" : mag < 14 ? "6-inch telescope" : "8-inch telescope",
        whatYoullSee: `A faint point at magnitude ${mag.toFixed(1)} in ${constellationName}. ${snia > 0.5 ? "Likely a Type Ia supernova — a white dwarf that detonated." : "A transient event detected by automated sky surveys."}`,
        whyItMatters: `Real alert from the Fink broker processing ZTF sky survey data. ${snia > 0.5 ? `${Math.round(snia * 100)}% probability of being a Type Ia supernova — the kind used to measure the expansion of the universe.` : "Automated classification is still working on this one."}`,
        rarityExplanation: snia > 0.5
          ? "Genuine supernova candidates are rare. This was flagged by machine learning classifiers."
          : "Detected by automated sky surveys scanning millions of sources nightly.",
        isTransient: true,
        daysLeft,
      });
    }

    const filtered = transients
      .filter((t) => t.altitude > -10)
      .sort((a, b) => a.magnitude - b.magnitude)
      .slice(0, 3);

    if (filtered.length === 0) {
      return fetchALeRCE(lat, lng);
    }

    return filtered;
  } catch {
    return fetchALeRCE(lat, lng);
  }
}

export async function buildTonightData(
  lat: number,
  lng: number,
  locationName: string,
  equipment: Equipment,
): Promise<TonightData> {
  const now = new Date();

  const [weather, moonSun, issPasses, transients] = await Promise.all([
    fetchWeather(lat, lng),
    Promise.resolve(computeMoonAndSun(lat, lng, now)),
    fetchISS(lat, lng),
    fetchTransients(lat, lng),
  ]);

  const bortle = estimateBortle(lat, lng);

  const conditions: SkyConditions = {
    cloudCover: weather.cloudCover,
    moonPhase: moonSun.moonPhase,
    moonAltitude: moonSun.moonAltitude,
    seeing: weather.seeing,
    transparency: weather.seeing > 5 ? 7 : 5,
    bortle,
    temperature: weather.temperature,
    humidity: weather.humidity,
    sunset: moonSun.sunset,
    astronomicalTwilight: moonSun.twilight,
    sunrise: moonSun.sunrise,
  };

  const planets = computePlanets(lat, lng, now);
  const deepSky = deepSkyObjects(lat, lng, now);
  const allObjects = [...transients, ...issPasses, ...planets, ...deepSky]
    .filter((o) => o.type === "satellite" || o.type === "supernova" || o.type === "nova" || o.altitude > 5)
    .sort((a, b) => {
      const rarityOrder = { legendary: 0, extraordinary: 1, rare: 2, notable: 3, common: 4 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity] || a.magnitude - b.magnitude;
    });

  const { verdict, reason, detail } = computeVerdict(conditions, allObjects, equipment);
  const upcoming = computeUpcoming(lat, lng);

  return {
    location: { name: locationName, lat, lng },
    date: now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    localTime: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    verdict,
    verdictReason: reason,
    verdictDetail: detail,
    conditions,
    objects: allObjects.slice(0, 8),
    upcoming,
  };
}

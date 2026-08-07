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
): Promise<{ cloudCover: number; temperature: number; humidity: number; seeing: number }> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return { cloudCover: 20, temperature: 22, humidity: 40, seeing: 6 };
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`,
    );
    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();

    const clouds = data.clouds?.all ?? 20;
    const temp = Math.round(data.main?.temp ?? 22);
    const humid = data.main?.humidity ?? 40;
    const seeing = clouds < 20 && humid < 60 ? 7 : clouds < 50 ? 5 : 3;

    return { cloudCover: clouds, temperature: temp, humidity: humid, seeing };
  } catch {
    return { cloudCover: 20, temperature: 22, humidity: 40, seeing: 6 };
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

export async function fetchTransients(): Promise<CelestialObject[]> {
  try {
    const res = await fetch(
      "https://www.wis-tns.org/api/get/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "tns_marker{\"tns_id\":\"LOOKUP\",\"type\":\"bot\",\"name\":\"LOOKUP\"}",
        },
        body: new URLSearchParams({
          api_key: process.env.TNS_API_KEY ?? "",
          data: JSON.stringify({
            discovered_period_value: "30",
            discovered_period_units: "days",
            unclassified_at: "0",
            classified_sne: "1",
            include_frb: "0",
            name: "",
            name_like: "0",
            isTNS_AT: "yes",
            public: "1",
            ra: "",
            decl: "",
            radius: "",
            coords_unit: "arcsec",
            reporting_groupid: [],
            groupid: [],
            classifier_groupid: [],
            objtype: [],
            at_type: "",
            date_start: [{ value: "" }],
            date_end: [{ value: "" }],
            discovery_mag_min: "",
            discovery_mag_max: "16",
            internal_name: "",
            discoverer: "",
            classifier: "",
            spectra_count: "",
            redshift_min: "",
            redshift_max: "",
            hostname: "",
            ext_catid: "",
            ra_range_min: "",
            ra_range_max: "",
            decl_range_min: "",
            decl_range_max: "",
            discovery_instrument: [],
            classification_instrument: [],
            associated_groups: [],
            official_discovery: "0",
            official_classification: "0",
            at_rep_remarks: "",
            class_rep_remarks: "",
            frb_repeat: "",
            frb_repeater_of_objid: "",
            frb_measured_redshift: "0",
            frb_dm_range_min: "",
            frb_dm_range_max: "",
            frb_rm_range_min: "",
            frb_rm_range_max: "",
            frb_snr_range_min: "",
            frb_snr_range_max: "",
            frb_flux_range_min: "",
            frb_flux_range_max: "",
            num_page: "10",
            display: [{ value: "0" }],
          }),
        }),
      },
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.data?.reply) return [];

    const transients: CelestialObject[] = [];
    for (const item of data.data.reply) {
      const mag = parseFloat(item.discovmag ?? "99");
      if (mag > 16 || isNaN(mag)) continue;

      const raStr = item.ra ?? "";
      const decStr = item.declination ?? "";
      if (!raStr || !decStr) continue;

      const raParts = raStr.split(":");
      const raHours = raParts.length === 3
        ? parseFloat(raParts[0]) + parseFloat(raParts[1]) / 60 + parseFloat(raParts[2]) / 3600
        : parseFloat(raStr) / 15;

      const decParts = decStr.split(":");
      const decDeg = decParts.length === 3
        ? (decStr.startsWith("-") ? -1 : 1) *
          (Math.abs(parseFloat(decParts[0])) + parseFloat(decParts[1]) / 60 + parseFloat(decParts[2]) / 3600)
        : parseFloat(decStr);

      if (isNaN(raHours) || isNaN(decDeg)) continue;

      let constellationName = "Unknown";
      try {
        const constel = Astronomy.Constellation(raHours, decDeg);
        constellationName = constel.name;
      } catch {}

      const name = item.prefix && item.objname
        ? `${item.prefix} ${item.objname}`
        : item.objname ?? "Unknown transient";

      const objType = (item.type ?? "").toLowerCase();
      let type: "supernova" | "nova" = "supernova";
      if (objType.includes("nova") && !objType.includes("supernova")) type = "nova";

      const discovDate = item.discoverydate ? new Date(item.discoverydate) : null;
      const daysLeft = discovDate
        ? Math.max(1, Math.ceil((discovDate.getTime() + 120 * 86400000 - Date.now()) / 86400000))
        : undefined;

      transients.push({
        id: `tns-${item.objname ?? Math.random().toString(36).slice(2)}`,
        name,
        type,
        rarity: mag < 12 ? "rare" : "notable",
        magnitude: Math.round(mag * 10) / 10,
        constellation: constellationName,
        altitude: 0,
        azimuth: 0,
        bestTime: "check chart",
        minimumAperture: mag < 6 ? "Naked eye" : mag < 10 ? "Binoculars" : `${Math.ceil(mag / 2)}-inch telescope`,
        whatYoullSee: `A point of light at magnitude ${mag.toFixed(1)} in ${constellationName}. ${type === "supernova" ? "A star that exploded in another galaxy." : "A stellar explosion that will fade over weeks."}`,
        whyItMatters: `Real transient discovered by the astronomical community. ${type === "supernova" ? "Supernovae this bright are rare — a few per year at most." : "A genuine astronomical event happening right now."}`,
        rarityExplanation: `Discovered recently and fading. ${mag < 12 ? "Bright enough for amateur equipment." : "Requires a telescope."}`,
        isTransient: true,
        daysLeft,
      });
    }

    return transients.slice(0, 3);
  } catch {
    return [];
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
    fetchTransients(),
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

import { NextRequest, NextResponse } from "next/server";

const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_URL =
  process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com";

interface IdentifyRequest {
  description: string;
  lat: number;
  lng: number;
  localTime: string;
}

async function getIAMToken(apiKey: string): Promise<string> {
  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
  });
  if (!res.ok) throw new Error("Failed to get IAM token");
  const data = await res.json();
  return data.access_token;
}

async function callWatsonx(
  token: string,
  prompt: string,
): Promise<string> {
  const res = await fetch(
    `${WATSONX_URL}/ml/v1/text/generation?version=2024-03-14`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "ibm/granite-3-8b-instruct",
        input: prompt,
        project_id: WATSONX_PROJECT_ID,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`watsonx error: ${err}`);
  }

  const data = await res.json();
  return data.results?.[0]?.generated_text ?? "";
}

function buildPrompt(req: IdentifyRequest): string {
  return `You are LOOKUP, an astronomy identification assistant. A user is asking "what was that light?" Based on their description, identify the most likely celestial objects or phenomena.

User location: ${req.lat.toFixed(2)}N, ${req.lng.toFixed(2)}E
Local time when observed: ${req.localTime}

User description: "${req.description}"

Analyze this sighting and return a JSON array of up to 3 matches, ordered by confidence (highest first). Each match should have:
- "confidence": number 0-100
- "name": specific name (e.g., "Starlink Group 15-2", "ISS", "Venus")
- "type": category (e.g., "Satellite train", "Space station", "Planet", "Aircraft", "Meteor")
- "explanation": 2-3 sentences explaining why this matches or doesn't match their description, referencing specific details they mentioned

Consider:
- Satellite passes (Starlink trains, ISS, Iridium flares)
- Planets (Venus, Jupiter, Mars near horizon)
- Meteors and fireballs
- Aircraft (blinking lights, holding patterns)
- Astronomical events (comets, conjunctions)
- Atmospheric phenomena (sun dogs, light pillars)

Return ONLY the JSON array, no other text.`;
}

function fallbackIdentify(description: string): {
  confidence: number;
  name: string;
  type: string;
  explanation: string;
}[] {
  const lower = description.toLowerCase();

  const results = [];

  if (lower.includes("train") || lower.includes("line") || lower.includes("dots") || lower.includes("row")) {
    results.push({
      confidence: 88,
      name: "Starlink satellite train",
      type: "Satellite train",
      explanation:
        "A line of steady dots moving across the sky is the signature of a recently launched Starlink batch. These satellites fly in a low-altitude train before spreading out over days.",
    });
  }

  if (lower.includes("bright") || lower.includes("steady") || lower.includes("moving")) {
    results.push({
      confidence: results.length > 0 ? 8 : 72,
      name: "ISS",
      type: "Space station",
      explanation:
        "The International Space Station appears as a very bright, steady light moving smoothly across the sky over 4-6 minutes. It does not blink.",
    });
  }

  if (lower.includes("flash") || lower.includes("flare") || lower.includes("brief")) {
    results.push({
      confidence: results.length > 0 ? 5 : 65,
      name: "Iridium flare",
      type: "Satellite flare",
      explanation:
        "A brief, intense flash from a satellite catching sunlight. Classic Iridium flares are less common now, but similar glints still occur from other satellites.",
    });
  }

  if (lower.includes("streak") || lower.includes("fast") || lower.includes("shooting")) {
    results.push({
      confidence: results.length > 0 ? 5 : 78,
      name: "Meteor / fireball",
      type: "Meteor",
      explanation:
        "A fast streak lasting under 5 seconds is typically a meteor burning up in the atmosphere. Brighter ones are called fireballs.",
    });
  }

  if (lower.includes("blink") || lower.includes("red") || lower.includes("green")) {
    results.push({
      confidence: results.length > 0 ? 3 : 60,
      name: "Aircraft",
      type: "Aviation",
      explanation:
        "Blinking lights (especially red/green navigation lights) are characteristic of aircraft. Steady lights without blinking are more likely satellites.",
    });
  }

  if (results.length === 0) {
    results.push(
      {
        confidence: 45,
        name: "Satellite pass",
        type: "Satellite",
        explanation:
          "A steady moving light is most commonly a satellite reflecting sunlight. Thousands are visible on any clear night.",
      },
      {
        confidence: 30,
        name: "Aircraft",
        type: "Aviation",
        explanation:
          "Could be a high-altitude aircraft. Look for blinking navigation lights — satellites do not blink.",
      },
      {
        confidence: 15,
        name: "Planet",
        type: "Planet",
        explanation:
          "Very bright, stationary lights near the horizon are often planets (Venus, Jupiter). They do not move noticeably during a few minutes of observation.",
      },
    );
  }

  return results.slice(0, 3);
}

export async function POST(request: NextRequest) {
  const body: IdentifyRequest = await request.json();

  if (!body.description || body.description.trim().length < 10) {
    return NextResponse.json(
      { error: "Description must be at least 10 characters" },
      { status: 400 },
    );
  }

  if (WATSONX_API_KEY && WATSONX_PROJECT_ID) {
    try {
      const token = await getIAMToken(WATSONX_API_KEY);
      const prompt = buildPrompt(body);
      const raw = await callWatsonx(token, prompt);

      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ results, source: "watsonx" });
      }
    } catch (err) {
      console.error("watsonx identify failed, using fallback:", err);
    }
  }

  const results = fallbackIdentify(body.description);
  return NextResponse.json({ results, source: "fallback" });
}

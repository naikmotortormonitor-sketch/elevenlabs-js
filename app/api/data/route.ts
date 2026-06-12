import { NextResponse } from "next/server"

// The existing CommonJS library lives at the repo root.
const elevenlabs = require("@/index.js")

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 500 })
  }
  elevenlabs.setApiKey(apiKey)

  try {
    const [voices, models, user, subscription] = await Promise.all([
      elevenlabs.getVoices(),
      elevenlabs.getModels(),
      elevenlabs.getUser().catch(() => null),
      elevenlabs.getUserSubscription().catch(() => null),
    ])

    return NextResponse.json({
      voices: Array.isArray(voices) ? voices : (voices?.voices ?? []),
      models: models ?? [],
      user,
      subscription,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.response?.data?.detail?.message ?? e?.message ?? "Failed to load data" },
      { status: e?.response?.status ?? 500 },
    )
  }
}

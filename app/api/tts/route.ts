import { NextResponse } from "next/server"
import { readFile, unlink } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"

const elevenlabs = require("@/index.js")

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 500 })
  }
  elevenlabs.setApiKey(apiKey)

  const { voiceId, text, modelId } = await req.json()
  if (!voiceId || !text) {
    return NextResponse.json({ error: "voiceId and text are required" }, { status: 400 })
  }

  const filePath = join(tmpdir(), `tts-${Date.now()}.mp3`)

  try {
    const audio = await elevenlabs.textToSpeech(voiceId, text, modelId || "eleven_multilingual_v2")
    await audio.saveFile(filePath)
    const buffer = await readFile(filePath)
    await unlink(filePath).catch(() => {})

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    })
  } catch (e: any) {
    await unlink(filePath).catch(() => {})
    const status = e?.response?.status ?? 500
    let message = e?.message ?? "Text-to-speech failed"

    // The library requests a stream, so error bodies arrive as a stream. Drain it to read the detail.
    const body = e?.response?.data
    if (body && typeof body.on === "function") {
      try {
        const chunks: Buffer[] = []
        for await (const chunk of body) chunks.push(Buffer.from(chunk))
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"))
        message = parsed?.detail?.message ?? parsed?.detail ?? message
      } catch {
        /* keep default message */
      }
    } else if (body?.detail?.message) {
      message = body.detail.message
    }

    if (status === 401) {
      message =
        "ElevenLabs rejected the request (401). " +
        (message || "Your account likely has a pending or failed payment — resolve the invoice in the ElevenLabs billing dashboard.")
    }

    return NextResponse.json({ error: message }, { status })
  }
}

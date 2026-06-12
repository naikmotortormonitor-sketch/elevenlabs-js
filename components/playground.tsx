"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"

type Voice = { voice_id: string; name: string; category?: string }
type Model = { model_id: string; name: string }
type ApiData = {
  voices: Voice[]
  models: Model[]
  user: any
  subscription: { tier?: string; character_count?: number; character_limit?: number } | null
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function Playground() {
  const { data, isLoading } = useSWR<ApiData>("/api/data", fetcher)

  const [text, setText] = useState("Hello from the elevenlabs-js playground!")
  const [voiceId, setVoiceId] = useState("")
  const [modelId, setModelId] = useState("eleven_multilingual_v2")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (data?.voices?.length && !voiceId) setVoiceId(data.voices[0].voice_id)
  }, [data, voiceId])

  async function generate() {
    setGenerating(true)
    setError(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId, text, modelId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const sub = data?.subscription
  const usagePct =
    sub?.character_limit && sub?.character_count != null
      ? Math.min(100, Math.round((sub.character_count / sub.character_limit) * 100))
      : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Account card */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Account</h2>
          {sub?.tier && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize text-foreground">
              {sub.tier}
            </span>
          )}
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading account…</p>
        ) : data?.error ? (
          <p className="text-sm text-red-400">{data.error}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Characters used</span>
              <span className="font-medium">
                {sub?.character_count?.toLocaleString() ?? 0} /{" "}
                {sub?.character_limit?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.voices?.length ?? 0} voices · {data?.models?.length ?? 0} models available
            </p>
          </div>
        )}
      </section>

      {/* Generator card */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Generate audio</h2>

        <div className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type something to speak…"
            className="w-full resize-y rounded-md border border-border bg-muted p-3 text-sm leading-relaxed text-foreground outline-none focus:border-primary"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Voice</span>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                {data?.voices?.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.name}
                    {v.category ? ` · ${v.category}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Model</span>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                {data?.models?.map((m) => (
                  <option key={m.model_id} value={m.model_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={generate}
            disabled={generating || !voiceId || !text.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate speech"}
          </button>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {audioUrl && (
            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted p-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio ref={audioRef} controls src={audioUrl} className="w-full" />
              <a
                href={audioUrl}
                download="speech.mp3"
                className="text-xs font-medium text-accent hover:underline"
              >
                Download mp3
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

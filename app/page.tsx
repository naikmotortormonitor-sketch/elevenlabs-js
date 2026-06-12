import { Playground } from "@/components/playground"

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10 flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            elevenlabs-js · v1.2.6
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Text to Speech Playground
          </h1>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            A web interface for the open-source elevenlabs-js library. Pick a voice, type your
            text, and generate audio using the ElevenLabs API.
          </p>
        </header>
        <Playground />
      </div>
    </main>
  )
}

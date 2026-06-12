import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ElevenLabs JS Playground",
  description: "A web playground for the elevenlabs-js text-to-speech library",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={geist.className}>{children}</body>
    </html>
  )
}

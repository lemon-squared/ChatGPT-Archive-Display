import { google } from "@atlas/font"

export const sans = google({
  family: "Public Sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font",
  display: "swap",
})

export const display = google({
  family: "Fraunces",
  subsets: ["latin"],
  weight: ["500", "700"],
  axes: { opsz: "9..144" },
  variable: "--font-display",
  display: "swap",
})

export const mono = google({
  family: "IBM Plex Mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
})

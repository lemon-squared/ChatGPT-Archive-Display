import { google } from "@atlas/font"

export const sans = google({
  family: "Public Sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font",
})

export const display = google({
  family: "Fraunces",
  subsets: ["latin"],
  weight: ["500", "700"],
  axes: { opsz: "9..144" },
  variable: "--font-display",
})

export const mono = google({
  family: "IBM Plex Mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
})

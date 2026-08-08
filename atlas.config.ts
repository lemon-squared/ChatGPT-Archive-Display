import { font } from "@atlas/font"
import type { AtlasConfig } from "@atlas/plugin"
import { tailwind } from "@atlas/tailwind"
import { display, mono, sans } from "./fonts.ts"

/** Chat Archive — Atlas + build-time Tailwind + self-hosted Google fonts. */
export default {
  plugins: [
    tailwind(),
    font({ fonts: [sans, display, mono] }),
  ],
} satisfies AtlasConfig

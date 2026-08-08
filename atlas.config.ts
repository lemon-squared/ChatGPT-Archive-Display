import type { AtlasConfig } from "@atlas/plugin"
import { tailwind } from "@atlas/tailwind"

/** Chat Archive — Atlas + build-time Tailwind. */
export default {
  plugins: [tailwind()],
} satisfies AtlasConfig

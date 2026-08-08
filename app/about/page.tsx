/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"
import { Link } from "@atlas/ui"
import { ProsePage } from "../../components/ProsePage.tsx"

export function generateMetadata(_ctx: AtlasContext): PageMetadata {
  return {
    title: "About · Chat Archive",
    description:
      "Privacy-first ChatGPT export viewer built on Atlas — HTML-first pages with one client island.",
  }
}

export default function AboutPage(_ctx: AtlasContext) {
  return (
    <ProsePage
      title="About Chat Archive"
      lede="A browser-only viewer for ChatGPT data exports, shaped as a small multi-page Atlas app."
    >
      <h2 class="font-display">Privacy</h2>
      <p>
        Archives are read entirely in your browser. There is no upload API and no server-side parse
        step. Refreshing the viewer clears the in-memory archive.
      </p>

      <h2 class="font-display">Why Atlas</h2>
      <p>
        Marketing and documentation routes render as HTML with{" "}
        <Link href="/">zero client JavaScript</Link>. Interactive ZIP handling is isolated to the{" "}
        <Link href="/viewer">viewer island</Link>, which Atlas bundles (including{" "}
        <code>jszip</code>) into <code>.atlas/client/</code>.
      </p>

      <h2 class="font-display">Stack</h2>
      <ul>
        <li>Atlas compiler + runtime (SSR pages, loaders, islands)</li>
        <li>
          <code>@atlas/tailwind</code> and <code>@atlas/font</code> (self-hosted Public Sans,
          Fraunces, IBM Plex Mono)
        </li>
        <li>Bun for install, test, and Atlas CLI</li>
      </ul>

      <p>
        <Link href="/viewer" class="btn btn-primary">
          Open the viewer
        </Link>
      </p>
    </ProsePage>
  )
}

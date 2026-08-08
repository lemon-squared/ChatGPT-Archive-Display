/** @jsxImportSource @atlas/renderer */
import type { AtlasProps } from "@atlas/renderer"
import { display, mono, sans } from "../fonts.ts"

export default function Layout(props: AtlasProps) {
  return (
    <div class={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <a
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--canvas)]"
        href="#main"
      >
        Skip to content
      </a>
      <main id="main">{props.children}</main>
    </div>
  )
}

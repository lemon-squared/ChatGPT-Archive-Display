/** @jsxImportSource @atlas/renderer */
import type { AtlasProps } from "@atlas/renderer"
import { Link } from "@atlas/ui"
import { display, mono, sans } from "../fonts.ts"

export default function Layout(props: AtlasProps) {
  return (
    <div class={`site ${sans.variable} ${display.variable} ${mono.variable}`}>
      <Link
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--canvas)]"
        href="#main"
      >
        Skip to content
      </Link>
      <header class="site-header">
        <Link href="/" class="site-brand font-display">
          Chat Archive
        </Link>
        <nav class="site-nav" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/viewer">Viewer</Link>
          <Link href="/about">About</Link>
          <Link href="/guide">Guides</Link>
        </nav>
      </header>
      <main id="main">{props.children}</main>
      <footer class="site-footer">
        <p>
          Built with{" "}
          <a href="https://github.com/lemon-squared/Atlas" rel="noopener noreferrer">
            Atlas
          </a>{" "}
          — HTML first, JavaScript optional. Parsing stays in your browser.
        </p>
      </footer>
    </div>
  )
}

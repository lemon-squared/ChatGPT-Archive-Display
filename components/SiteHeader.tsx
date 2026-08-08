/** @jsxImportSource @atlas/renderer */
import { Link } from "@atlas/ui"
import { SiteBrand } from "./SiteBrand.tsx"

export function SiteHeader() {
  return (
    <header class="site-header">
      <SiteBrand />
      <nav class="site-nav" aria-label="Primary">
        <Link href="/">Home</Link>
        <Link href="/viewer">Viewer</Link>
        <Link href="/about">About</Link>
        <Link href="/guide">Guides</Link>
      </nav>
    </header>
  )
}

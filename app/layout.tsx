/** @jsxImportSource @atlas/renderer */
import type { AtlasProps } from "@atlas/renderer"
import { SiteFooter } from "../components/SiteFooter.tsx"
import { SiteHeader } from "../components/SiteHeader.tsx"
import { SkipLink } from "../components/SkipLink.tsx"
import { display, mono, sans } from "../fonts.ts"

export default function Layout(props: AtlasProps) {
  return (
    <div class={`site ${sans.variable} ${display.variable} ${mono.variable}`}>
      <SkipLink />
      <SiteHeader />
      <main id="main">{props.children}</main>
      <SiteFooter />
    </div>
  )
}

/** @jsxImportSource @atlas/renderer */
import type { AtlasProps } from "@atlas/renderer"

export default function Layout(props: AtlasProps) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <a
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--canvas)]"
        href="#main"
      >
        Skip to content
      </a>
      <main id="main">{props.children}</main>
    </>
  )
}

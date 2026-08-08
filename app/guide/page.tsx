/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"
import { Link } from "@atlas/ui"
import { listGuides } from "../../data/guides.ts"

export function generateMetadata(_ctx: AtlasContext): PageMetadata {
  return {
    title: "Guides · Chat Archive",
    description: "Server-rendered guides on ChatGPT exports and how this Atlas app is structured.",
  }
}

export default function GuideIndexPage(_ctx: AtlasContext) {
  const guides = listGuides()
  return (
    <section class="prose-page">
      <h1 class="font-display">Guides</h1>
      <p class="lede">
        Read these as plain HTML — loaded on the server, no client bundle required.
      </p>
      <ol class="guide-list">
        {guides.map((guide) => (
          <li>
            <Link href={`/guide/${guide.slug}`}>{guide.title}</Link>
            <p>{guide.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

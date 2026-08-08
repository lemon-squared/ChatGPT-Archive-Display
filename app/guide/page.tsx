/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"
import { GuideList } from "../../components/GuideList.tsx"
import { ProsePage } from "../../components/ProsePage.tsx"
import { listGuides } from "../../data/guides.ts"

export function generateMetadata(_ctx: AtlasContext): PageMetadata {
  return {
    title: "Guides · Chat Archive",
    description: "Server-rendered guides on ChatGPT exports and how this Atlas app is structured.",
  }
}

export default function GuideIndexPage(_ctx: AtlasContext) {
  return (
    <ProsePage
      as="section"
      title="Guides"
      lede="Read these as plain HTML — loaded on the server, no client bundle required."
    >
      <GuideList guides={listGuides()} />
    </ProsePage>
  )
}

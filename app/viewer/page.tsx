/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"

export function generateMetadata(_ctx: AtlasContext): PageMetadata {
  return {
    title: "Viewer · Chat Archive",
    description:
      "Drop a ChatGPT export ZIP or conversations.json. Parsing stays in your browser — nothing is uploaded.",
  }
}

export default function ViewerPage(_ctx: AtlasContext) {
  return (
    <div class="viewer-frame">
      <chat-archive sample-url="/sample-conversations.json"></chat-archive>
    </div>
  )
}

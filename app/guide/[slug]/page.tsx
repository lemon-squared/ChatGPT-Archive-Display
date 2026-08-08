/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"
import { notFound } from "@atlas/runtime"
import { Link } from "@atlas/ui"
import { getGuide, type Guide } from "../../../data/guides.ts"

/** RFC-009: entities this route loader loads. */
export const loads = ["Guide"]

/** RFC-009: entities this page component uses. */
export const uses = ["Guide"]

export async function loader(ctx: AtlasContext): Promise<Guide> {
  const guide = getGuide(ctx.params.slug ?? "")
  if (!guide) notFound("Guide not found")
  return guide
}

export function generateMetadata(ctx: AtlasContext): PageMetadata {
  const guide = ctx.data as Guide
  return {
    title: `${guide.title} · Chat Archive`,
    description: guide.summary,
    openGraph: {
      title: guide.title,
      description: guide.summary,
      type: "article",
    },
  }
}

export default function GuideSlugPage(ctx: AtlasContext) {
  const guide = ctx.data as Guide

  return (
    <article class="prose-page">
      <p class="eyebrow">
        <Link href="/guide">Guides</Link>
      </p>
      <h1 class="font-display">{guide.title}</h1>
      <p class="lede">{guide.summary}</p>
      {guide.body.map((paragraph) => (
        <p>{paragraph}</p>
      ))}
      <p class="guide-next">
        <Link href="/guide">← All guides</Link>
        {" · "}
        <Link href="/viewer">Open viewer</Link>
      </p>
    </article>
  )
}

/** @jsxImportSource @atlas/renderer */
import type { AtlasNode } from "@atlas/renderer"

export function ProsePage(props: {
  as?: "article" | "section"
  title: string
  lede?: string
  eyebrow?: AtlasNode
  children?: AtlasNode
}) {
  const body = (
    <>
      {props.eyebrow ? <p class="eyebrow">{props.eyebrow}</p> : null}
      <h1 class="font-display">{props.title}</h1>
      {props.lede ? <p class="lede">{props.lede}</p> : null}
      {props.children}
    </>
  )

  return props.as === "section" ? (
    <section class="prose-page">{body}</section>
  ) : (
    <article class="prose-page">{body}</article>
  )
}

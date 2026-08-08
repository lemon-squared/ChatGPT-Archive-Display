export type Guide = {
  slug: string
  title: string
  summary: string
  order: number
  body: string[]
}

export const guides: Guide[] = [
  {
    slug: "chatgpt-exports",
    title: "ChatGPT export format",
    summary: "What lives inside conversations.json — mapping, current_node, and branches.",
    order: 1,
    body: [
      "A ChatGPT data export is usually a ZIP that contains conversations.json: an array of conversation objects.",
      "Each conversation has a mapping of node ids to messages, plus current_node — the leaf of the path the UI was showing when you exported.",
      "Siblings under the same parent are regenerations or alternate branches. Walking only current_node recovers the “main” path; scanning the full mapping surfaces every turn, including ones the client may hide.",
      "This app never uploads your file. The <chat-archive> island reads the ZIP or JSON in the browser with JSZip, then flattens the DAG for browsing.",
    ],
  },
  {
    slug: "off-path-messages",
    title: "Finding off-path messages",
    summary: "Recover branched and regenerated turns that look “missing” in ChatGPT.",
    order: 2,
    body: [
      "When you regenerate a reply or edit an earlier prompt, ChatGPT keeps prior nodes in mapping but points current_node at the new leaf.",
      "The ChatGPT client typically shows only the active path. Older siblings still exist in the export — they just are not on that path.",
      "In the viewer, use All nodes to see every message in time order, or Off-path only to highlight turns that are not on the current path.",
      "Branch badges (for example branch 2/3) mark sibling groups under the same parent so you can see where the tree forked.",
    ],
  },
  {
    slug: "atlas-routing",
    title: "Atlas multi-page routing",
    summary: "How this app’s pages compile to manifests — and why the homepage ships zero JS.",
    order: 3,
    body: [
      "Atlas uses file-based routes under app/. Each page.tsx becomes a RouteRecord in .atlas/routes.json at build time.",
      "At request time the runtime matches the URL against those manifests. It never scans app/ or ships a client-side router.",
      "Marketing pages (home, about, guides) are pure SSR HTML with <Link> navigation — no islands, so x-atlas-js stays 0.",
      "Only /viewer mounts <chat-archive>. Atlas bundles that island and its npm deps (jszip) into .atlas/client/ and serves them at /_atlas/islands/…",
    ],
  },
  {
    slug: "atlas-islands",
    title: "Islands and client JS budget",
    summary: "Interactive ZIP parsing lives in one opt-in island; everything else is HTML.",
    order: 4,
    body: [
      "Atlas islands are custom elements under elements/. They are bundled only when a page actually renders the tag.",
      "Bare imports like import JSZip from \"jszip\" resolve at atlas build via Bun.build (browser ESM, packages bundled).",
      "Server-only modules (node:*, @atlas/runtime, …) are rejected in island graphs so client bundles stay safe.",
      "That keeps the privacy story honest: heavy parsing stays on-device, while catalogue-style pages remain zero-JS.",
    ],
  },
]

export function listGuides(): Guide[] {
  return [...guides].sort((a, b) => a.order - b.order)
}

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

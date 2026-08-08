/** @jsxImportSource @atlas/renderer */
import type { PageMetadata } from "@atlas/metadata"
import type { AtlasContext } from "@atlas/runtime"
import { Link } from "@atlas/ui"
import { BranchTree } from "../components/BranchTree.tsx"

export function generateMetadata(_ctx: AtlasContext): PageMetadata {
  return {
    title: "Chat Archive",
    description:
      "Browse ChatGPT data exports in the browser — including branched turns the client may hide. Built with Atlas.",
    openGraph: {
      title: "Chat Archive",
      description:
        "Browse ChatGPT data exports in the browser — including branched turns the client may hide.",
      type: "website",
    },
  }
}

export default function Page(_ctx: AtlasContext) {
  return (
    <>
      <section class="hero">
        <div class="hero-atmosphere" aria-hidden="true" />
        <div class="hero-visual" aria-hidden="true">
          <BranchTree />
        </div>
        <div class="hero-copy">
          <p class="site-brand font-display hero-brand">Chat Archive</p>
          <h1 class="hero-title font-display">See every turn your export still holds</h1>
          <p class="hero-lede">
            Drop a ChatGPT ZIP or <code>conversations.json</code> and recover branched replies that
            look missing in the official client.
          </p>
          <div class="hero-cta">
            <Link href="/viewer" class="btn btn-primary">
              Open viewer
            </Link>
            <Link href="/guide/off-path-messages" class="btn btn-ghost">
              How off-path works
            </Link>
          </div>
        </div>
      </section>

      <section class="band">
        <h2 class="font-display">One job: read the whole tree</h2>
        <p class="band-lede">
          Exports keep the full message DAG. This app walks <code>mapping</code> and{" "}
          <code>current_node</code> so regenerated and sibling turns stay visible.
        </p>
        <ol class="steps">
          <li>
            <span class="step-index">01</span>
            <div>
              <h3>Export from ChatGPT</h3>
              <p>Download your data export and unzip if you only need conversations.json.</p>
            </div>
          </li>
          <li>
            <span class="step-index">02</span>
            <div>
              <h3>Open the viewer</h3>
              <p>Drop the ZIP or JSON on /viewer — files never leave this machine.</p>
            </div>
          </li>
          <li>
            <span class="step-index">03</span>
            <div>
              <h3>Toggle off-path</h3>
              <p>Use All nodes or Off-path only to surface branches the client may hide.</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="band band-atlas">
        <h2 class="font-display">A small Atlas showcase</h2>
        <p class="band-lede">
          This site is multi-page on purpose: SSR routes for reading, one island for interaction.
        </p>
        <ul class="atlas-points">
          <li>
            <strong>File routing</strong> — <code>app/**/page.tsx</code> compiles to manifests; no
            client router.
          </li>
          <li>
            <strong>Zero JS homepage</strong> — this page ships no island scripts (
            <code>x-atlas-js: 0</code>).
          </li>
          <li>
            <strong>Loader guides</strong> — <Link href="/guide">/guide/[slug]</Link> loads content
            on the server with <code>notFound()</code>.
          </li>
          <li>
            <strong>Opt-in island</strong> — only <Link href="/viewer">/viewer</Link> mounts{" "}
            <code>&lt;chat-archive&gt;</code> with JSZip bundled by Atlas.
          </li>
        </ul>
      </section>
    </>
  )
}

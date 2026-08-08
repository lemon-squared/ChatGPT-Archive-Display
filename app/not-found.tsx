/** @jsxImportSource @atlas/renderer */
import type { AtlasContext } from "@atlas/runtime"
import { Link } from "@atlas/ui"

export default function NotFoundPage(ctx: AtlasContext) {
  const message =
    typeof ctx.data === "object" &&
    ctx.data &&
    "message" in ctx.data &&
    typeof (ctx.data as { message: unknown }).message === "string"
      ? (ctx.data as { message: string }).message
      : "That page is not in this archive."

  return (
    <section class="prose-page">
      <h1 class="font-display">404</h1>
      <p class="lede">{message}</p>
      <p>
        <Link href="/" class="btn btn-primary">
          Back home
        </Link>
      </p>
    </section>
  )
}

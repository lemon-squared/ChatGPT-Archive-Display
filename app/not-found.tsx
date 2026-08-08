/** @jsxImportSource @atlas/renderer */
import type { AtlasContext } from "@atlas/runtime"
import { Link } from "@atlas/ui"
import { ProsePage } from "../components/ProsePage.tsx"

export default function NotFoundPage(ctx: AtlasContext) {
  const message =
    typeof ctx.data === "object" &&
    ctx.data &&
    "message" in ctx.data &&
    typeof (ctx.data as { message: unknown }).message === "string"
      ? (ctx.data as { message: string }).message
      : "That page is not in this archive."

  return (
    <ProsePage as="section" title="404" lede={message}>
      <p>
        <Link href="/" class="btn btn-primary">
          Back home
        </Link>
      </p>
    </ProsePage>
  )
}

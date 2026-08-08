/** @jsxImportSource @atlas/renderer */
import { Link } from "@atlas/ui"

export function SkipLink() {
  return (
    <Link
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--canvas)]"
      href="#main"
    >
      Skip to content
    </Link>
  )
}

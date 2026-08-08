/** @jsxImportSource @atlas/renderer */
import { Link } from "@atlas/ui"
import type { Guide } from "../data/guides.ts"

export function GuideList(props: { guides: Guide[] }) {
  return (
    <ol class="guide-list">
      {props.guides.map((guide) => (
        <li>
          <Link href={`/guide/${guide.slug}`}>{guide.title}</Link>
          <p>{guide.summary}</p>
        </li>
      ))}
    </ol>
  )
}

#!/usr/bin/env bun
/**
 * Bundle browser islands so npm deps (e.g. jszip) ship with the module.
 * Atlas serves files from elements/ as island scripts — no CDN imports.
 */
import { mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const outdir = join(root, "elements")

mkdirSync(outdir, { recursive: true })

// Clear previous generated islands so stale CDN builds don't linger
for await (const path of new Bun.Glob("*.js").scan({ cwd: outdir, absolute: true })) {
  rmSync(path, { force: true })
}

const result = await Bun.build({
  entrypoints: [join(root, "islands", "chat-archive.ts")],
  outdir,
  target: "browser",
  format: "esm",
  sourcemap: "none",
  minify: false,
})

if (!result.success) {
  console.error("Island bundle failed:")
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

const outputs = result.outputs.map((o) => o.path.replace(root + "/", ""))
console.log(`Bundled islands → ${outputs.join(", ")}`)

#!/usr/bin/env bun
import { existsSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const atlasRoot = join(root, "vendor", "Atlas")
const atlasCli = join(atlasRoot, "packages", "cli", "bin", "atlas.ts")

if (!existsSync(atlasCli)) {
  console.error("Atlas CLI missing. Run: bun run ensure-atlas")
  process.exit(1)
}

const args = process.argv.slice(2).flatMap((arg, index, all) => {
  // Make --dir absolute so it stays correct when cwd is the Atlas monorepo
  if (arg === "--dir" && all[index + 1] && !all[index + 1].startsWith("/")) {
    return [arg, join(root, all[index + 1])]
  }
  return [arg]
})

const proc = Bun.spawn(["bun", "run", atlasCli, ...args], {
  cwd: atlasRoot,
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
  env: process.env,
})
process.exit(await proc.exited)

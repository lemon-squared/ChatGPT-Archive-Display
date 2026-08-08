#!/usr/bin/env bun
import { join } from "node:path"
import { loadAtlasKnowledge, serveAtlasMcpStdio } from "@atlas/mcp"

const atlasDir = join(import.meta.dir, "..", ".atlas")
try {
  serveAtlasMcpStdio(loadAtlasKnowledge(atlasDir))
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

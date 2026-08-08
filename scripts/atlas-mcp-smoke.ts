#!/usr/bin/env bun
/**
 * Stdio smoke for `@atlas/mcp` against this app's `.atlas/`.
 *   bun run scripts/atlas-mcp-smoke.ts
 */
import { dirname, join, resolve } from "node:path"

const appRoot = resolve(import.meta.dir, "..")
const atlasRoot = join(appRoot, "vendor", "Atlas")
const atlasCli = join(atlasRoot, "packages", "cli", "bin", "atlas.ts")
const mcpClientRoot = join(atlasRoot, "node_modules", "@modelcontextprotocol", "client")

const { Client } = await import(join(mcpClientRoot, "dist", "index.mjs"))
const { StdioClientTransport } = await import(join(mcpClientRoot, "dist", "stdio.mjs"))

const PATHS = ["/", "/viewer", "/about", "/guide", "/guide/chatgpt-exports", "/missing"]

async function callJson(client: InstanceType<typeof Client>, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args })
  return {
    isError: Boolean(result.isError),
    structured: result.structuredContent ?? null,
    text: (result.content ?? [])
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("\n\n"),
  }
}

const transport = new StdioClientTransport({
  command: "bun",
  args: [atlasCli, "mcp", "--dir", appRoot],
  cwd: atlasRoot,
  stderr: "pipe",
})
const client = new Client({ name: "chatgpt-archive-mcp-smoke", version: "0.0.1" })
await client.connect(transport)

try {
  const listed = await client.listTools()
  const inspect = await callJson(client, "inspect_application")
  const routes = []
  for (const path of PATHS) {
    routes.push({ path, ...(await callJson(client, "explain_route", { path })) })
  }
  const impactGuide = await callJson(client, "impact_analysis", { entity: "Guide" })
  const impactMissing = await callJson(client, "impact_analysis", { entity: "Conversation" })
  const traceMissing = await callJson(client, "trace_action", { action: "upload" })

  const report = {
    tools: listed.tools.map((t) => ({ name: t.name, description: t.description })),
    inspect,
    routes,
    impactGuide,
    impactMissing,
    traceMissing,
  }
  const out = join(dirname(import.meta.dir), ".atlas", "mcp-smoke.json")
  await Bun.write(out, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.error(`wrote ${out}`)
} finally {
  await client.close()
}

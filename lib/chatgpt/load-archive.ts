import JSZip from "jszip"

import { parseConversationsJson } from "./parse.ts"
import type { ParsedConversation } from "./types.ts"

export type ArchiveBundle = {
  sourceName: string
  conversations: ParsedConversation[]
}

async function parseZip(file: File): Promise<ParsedConversation[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const names = Object.keys(zip.files)
  const entry =
    zip.file("conversations.json") ||
    names
      .filter((name) => name.toLowerCase().endsWith("conversations.json"))
      .map((name) => zip.file(name))
      .find(Boolean)
  if (!entry) {
    if (names.some((name) => name.toLowerCase().endsWith("chat.html"))) {
      throw new Error("Found chat.html but no conversations.json.")
    }
    throw new Error("No conversations.json found inside the ZIP.")
  }
  return parseConversationsJson(JSON.parse(await entry.async("string")))
}

export async function loadArchiveFile(file: File): Promise<ArchiveBundle> {
  const lower = file.name.toLowerCase()
  let conversations: ParsedConversation[]
  if (lower.endsWith(".zip")) conversations = await parseZip(file)
  else if (lower.endsWith(".json")) conversations = parseConversationsJson(JSON.parse(await file.text()))
  else {
    try {
      conversations = parseConversationsJson(JSON.parse(await file.text()))
    } catch {
      conversations = await parseZip(file)
    }
  }
  if (!conversations.length) throw new Error("No conversations found in that file.")
  return { sourceName: file.name, conversations }
}

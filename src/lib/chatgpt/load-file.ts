import JSZip from "jszip";
import { parseConversationsJson } from "./parse";
import type { ArchiveBundle, ParsedConversation } from "./types";

async function readJsonText(text: string): Promise<unknown> {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("File is not valid JSON.");
  }
}

async function parseJsonFile(name: string, text: string): Promise<ParsedConversation[]> {
  const data = await readJsonText(text);
  return parseConversationsJson(data);
}

async function parseZipFile(file: File): Promise<ParsedConversation[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const names = Object.keys(zip.files);

  const conversationsEntry =
    zip.file("conversations.json") ||
    names
      .filter((name) => name.toLowerCase().endsWith("conversations.json"))
      .map((name) => zip.file(name))
      .find(Boolean);

  if (!conversationsEntry) {
    const hasChatHtml = names.some((name) => name.toLowerCase().endsWith("chat.html"));
    if (hasChatHtml) {
      throw new Error(
        "Found chat.html but no conversations.json. Re-export from ChatGPT and upload the ZIP that includes conversations.json.",
      );
    }
    throw new Error(
      "No conversations.json found inside the ZIP. Drop your ChatGPT data export archive.",
    );
  }

  const text = await conversationsEntry.async("string");
  return parseJsonFile(conversationsEntry.name, text);
}

export async function loadArchiveFile(file: File): Promise<ArchiveBundle> {
  const lower = file.name.toLowerCase();
  let conversations: ParsedConversation[];

  if (lower.endsWith(".zip")) {
    conversations = await parseZipFile(file);
  } else if (lower.endsWith(".json")) {
    conversations = await parseJsonFile(file.name, await file.text());
  } else {
    // Try JSON first, then ZIP — some browsers omit extensions on paste.
    try {
      conversations = await parseJsonFile(file.name, await file.text());
    } catch {
      conversations = await parseZipFile(file);
    }
  }

  if (conversations.length === 0) {
    throw new Error("No conversations found in that file.");
  }

  return {
    sourceName: file.name,
    conversations,
    loadedAt: Date.now(),
  };
}

export function isSupportedArchiveFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".zip") ||
    lower.endsWith(".json") ||
    file.type === "application/zip" ||
    file.type === "application/json" ||
    file.type === "application/x-zip-compressed"
  );
}

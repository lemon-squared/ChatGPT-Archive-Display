import { describe, expect, it } from "bun:test"
import { loadArchiveFile } from "./load-archive"
import type { RawConversation } from "./types"

const branched: RawConversation = {
  title: "Branch demo",
  create_time: 1700000000,
  update_time: 1700001000,
  conversation_id: "conv-1",
  default_model_slug: "gpt-4o",
  current_node: "a2",
  mapping: {
    root: {
      id: "root",
      parent: null,
      children: ["u1"],
      message: {
        id: "root",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
      },
    },
    u1: {
      id: "u1",
      parent: "root",
      children: ["a2"],
      message: {
        id: "u1",
        author: { role: "user" },
        create_time: 1700000001,
        content: { content_type: "text", parts: ["Hello"] },
      },
    },
    a2: {
      id: "a2",
      parent: "u1",
      children: [],
      message: {
        id: "a2",
        author: { role: "assistant" },
        create_time: 1700000003,
        content: { content_type: "text", parts: ["Current reply"] },
        metadata: { model_slug: "gpt-4o" },
      },
    },
  },
}

describe("loadArchiveFile", () => {
  it("parses conversations.json", async () => {
    const file = new File([JSON.stringify([branched])], "conversations.json", {
      type: "application/json",
    })
    const bundle = await loadArchiveFile(file)
    expect(bundle.sourceName).toBe("conversations.json")
    expect(bundle.conversations).toHaveLength(1)
    expect(bundle.conversations[0]?.title).toBe("Branch demo")
  })

  it("rejects empty arrays", async () => {
    const file = new File(["[]"], "conversations.json", { type: "application/json" })
    await expect(loadArchiveFile(file)).rejects.toThrow(/No conversations found/)
  })
})

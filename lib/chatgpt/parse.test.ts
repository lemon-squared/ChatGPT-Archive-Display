import { describe, expect, it } from "bun:test"
import { conversationMatchesQuery, flattenConversation, parseConversationsJson } from "./parse"
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
      children: ["a1", "a2"],
      message: {
        id: "u1",
        author: { role: "user" },
        create_time: 1700000001,
        content: { content_type: "text", parts: ["Hello"] },
      },
    },
    a1: {
      id: "a1",
      parent: "u1",
      children: [],
      message: {
        id: "a1",
        author: { role: "assistant" },
        create_time: 1700000002,
        content: { content_type: "text", parts: ["Old reply that looks missing"] },
        metadata: { model_slug: "gpt-4o" },
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

describe("flattenConversation", () => {
  it("walks current_node path and keeps off-path siblings available", () => {
    const parsed = flattenConversation(branched)
    expect(parsed.currentPath.map((m) => m.text)).toEqual(["Hello", "Current reply"])
    expect(parsed.hiddenCount).toBe(1)
    expect(parsed.allMessages.map((m) => m.text)).toContain("Old reply that looks missing")
    expect(parsed.allMessages.find((m) => m.id === "a1")?.onCurrentPath).toBe(false)
    expect(parsed.allMessages.find((m) => m.id === "a2")?.branchCount).toBe(2)
  })
})

describe("parseConversationsJson", () => {
  it("accepts a bare array", () => {
    const parsed = parseConversationsJson([branched])
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toBe("Branch demo")
  })

  it("rejects unknown shapes", () => {
    expect(() => parseConversationsJson({ foo: 1 })).toThrow(/Unrecognized JSON shape/)
  })
})

describe("conversationMatchesQuery", () => {
  it("matches title and message body", () => {
    const parsed = flattenConversation(branched)
    expect(conversationMatchesQuery(parsed, "branch")).toBe(true)
    expect(conversationMatchesQuery(parsed, "missing")).toBe(true)
    expect(conversationMatchesQuery(parsed, "zzzz")).toBe(false)
  })
})

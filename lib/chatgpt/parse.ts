import type {
  ContentPart,
  DisplayMessage,
  DisplayPart,
  MappingNode,
  ParsedConversation,
  RawConversation,
} from "./types"

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function partToDisplay(part: ContentPart): DisplayPart | null {
  if (typeof part === "string") {
    if (!part.trim()) return null
    return { kind: "text", text: part }
  }
  if (!part || typeof part !== "object") return null
  const contentType = asString(part.content_type)
  if (contentType === "image_asset_pointer" || part.asset_pointer) {
    return {
      kind: "image",
      label: asString(part.asset_pointer) || "Image attachment",
      text: asString(part.asset_pointer),
    }
  }
  if (contentType === "code" || part.language) {
    const text = asString(part.text)
    if (!text.trim()) return null
    return { kind: "code", text, language: asString(part.language) || undefined }
  }
  const text = asString(part.text)
  if (text.trim()) return { kind: "text", text }
  if (contentType) return { kind: "other", label: contentType, text: JSON.stringify(part) }
  return null
}

export function extractParts(message: MappingNode["message"]): DisplayPart[] {
  if (!message?.content) return []
  const content = message.content
  const parts: DisplayPart[] = []
  if (Array.isArray(content.parts)) {
    for (const part of content.parts) {
      const display = partToDisplay(part)
      if (display) parts.push(display)
    }
  }
  if (parts.length === 0 && typeof content.text === "string" && content.text.trim()) {
    parts.push({ kind: "text", text: content.text })
  }
  return parts
}

export function messageText(parts: DisplayPart[]): string {
  return parts
    .map((part) => part.text || part.label || "")
    .filter(Boolean)
    .join("\n\n")
}

function shouldIncludeMessage(
  message: NonNullable<MappingNode["message"]>,
  parts: DisplayPart[],
): boolean {
  const role = message.author?.role ?? "unknown"
  if (role === "system") {
    const isUserSystem = Boolean(message.metadata?.is_user_system_message)
    if (!isUserSystem) return false
  }
  return parts.length > 0
}

function getPathIds(conversation: RawConversation): string[] {
  const mapping = conversation.mapping ?? {}
  const path: string[] = []
  let nodeId: string | null | undefined = conversation.current_node
  const seen = new Set<string>()
  while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
    seen.add(nodeId)
    path.push(nodeId)
    nodeId = mapping[nodeId].parent
  }
  return path.reverse()
}

export function flattenConversation(conversation: RawConversation): ParsedConversation {
  const mapping = conversation.mapping ?? {}
  const pathIds = getPathIds(conversation)
  const pathSet = new Set(pathIds)

  const toDisplay = (nodeId: string): DisplayMessage | null => {
    const node = mapping[nodeId]
    const message = node?.message
    if (!message) return null
    const parts = extractParts(message)
    if (!shouldIncludeMessage(message, parts)) return null
    const parentId = node.parent ?? null
    const siblings =
      parentId && mapping[parentId]?.children
        ? mapping[parentId].children!.filter((id) => {
            const sibling = mapping[id]?.message
            if (!sibling) return false
            return shouldIncludeMessage(sibling, extractParts(sibling))
          })
        : [nodeId]
    const branchIndex = Math.max(0, siblings.indexOf(nodeId))
    const modelSlug =
      (typeof message.metadata?.model_slug === "string" ? message.metadata.model_slug : null) ??
      conversation.default_model_slug
    return {
      id: nodeId,
      role: message.author?.role ?? "unknown",
      authorName: message.author?.name,
      createTime: message.create_time ?? null,
      parts,
      text: messageText(parts),
      modelSlug,
      onCurrentPath: pathSet.has(nodeId),
      branchIndex: siblings.length > 1 ? branchIndex : undefined,
      branchCount: siblings.length > 1 ? siblings.length : undefined,
    }
  }

  const currentPath = pathIds.map((id) => toDisplay(id)).filter((m): m is DisplayMessage => Boolean(m))
  const allMessages = Object.keys(mapping)
    .map((id) => toDisplay(id))
    .filter((m): m is DisplayMessage => Boolean(m))
    .sort((a, b) => (a.createTime ?? 0) - (b.createTime ?? 0))

  const id =
    conversation.conversation_id ||
    conversation.id ||
    pathIds[pathIds.length - 1] ||
    `conversation-${Math.random().toString(36).slice(2)}`

  return {
    id,
    title: conversation.title?.trim() || "Untitled conversation",
    createTime: conversation.create_time ?? null,
    updateTime: conversation.update_time ?? null,
    modelSlug: conversation.default_model_slug ?? null,
    messageCount: allMessages.length,
    currentPathCount: currentPath.length,
    hiddenCount: Math.max(0, allMessages.length - currentPath.length),
    currentPath,
    allMessages,
  }
}

export function normalizeConversationList(data: unknown): RawConversation[] {
  if (Array.isArray(data)) {
    return data.filter(
      (value): value is RawConversation =>
        Boolean(value && typeof value === "object" && (value as RawConversation).mapping),
    )
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.conversations)) {
      return record.conversations.filter(
        (value): value is RawConversation =>
          Boolean(value && typeof value === "object" && (value as RawConversation).mapping),
      )
    }
    if (record.mapping && typeof record.mapping === "object") return [record as RawConversation]
  }
  throw new Error(
    "Unrecognized JSON shape. Expected conversations.json (an array of conversations).",
  )
}

export function parseConversationsJson(data: unknown): ParsedConversation[] {
  return normalizeConversationList(data)
    .map((conversation) => flattenConversation(conversation))
    .sort((a, b) => (b.updateTime ?? b.createTime ?? 0) - (a.updateTime ?? a.createTime ?? 0))
}

export function conversationMatchesQuery(conversation: ParsedConversation, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (conversation.title.toLowerCase().includes(q)) return true
  if (conversation.modelSlug?.toLowerCase().includes(q)) return true
  return conversation.allMessages.some((message) => message.text.toLowerCase().includes(q))
}

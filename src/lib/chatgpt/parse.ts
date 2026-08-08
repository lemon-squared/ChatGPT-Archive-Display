import type {
  ContentPart,
  DisplayMessage,
  DisplayPart,
  MappingNode,
  ParsedConversation,
  RawConversation,
} from "./types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function partToDisplay(part: ContentPart): DisplayPart | null {
  if (typeof part === "string") {
    if (!part.trim()) return null;
    return { kind: "text", text: part };
  }

  if (!part || typeof part !== "object") return null;

  const contentType = asString(part.content_type);
  if (contentType === "image_asset_pointer" || part.asset_pointer) {
    return {
      kind: "image",
      label: asString(part.asset_pointer) || "Image attachment",
      text: asString(part.asset_pointer),
    };
  }

  if (contentType === "code" || part.language) {
    const text = asString(part.text);
    if (!text.trim()) return null;
    return {
      kind: "code",
      text,
      language: asString(part.language) || undefined,
    };
  }

  const text = asString(part.text);
  if (text.trim()) {
    return { kind: "text", text };
  }

  if (contentType) {
    return { kind: "other", label: contentType, text: JSON.stringify(part) };
  }

  return null;
}

export function extractParts(message: MappingNode["message"]): DisplayPart[] {
  if (!message?.content) return [];

  const content = message.content;
  const parts: DisplayPart[] = [];

  if (Array.isArray(content.parts)) {
    for (const part of content.parts) {
      const display = partToDisplay(part);
      if (display) parts.push(display);
    }
  }

  if (parts.length === 0 && typeof content.text === "string" && content.text.trim()) {
    parts.push({ kind: "text", text: content.text });
  }

  return parts;
}

export function messageText(parts: DisplayPart[]): string {
  return parts
    .map((part) => part.text || part.label || "")
    .filter(Boolean)
    .join("\n\n");
}

function shouldIncludeMessage(
  message: NonNullable<MappingNode["message"]>,
  parts: DisplayPart[],
  options: { includeSystem: boolean },
): boolean {
  const role = message.author?.role ?? "unknown";
  if (role === "system" && !options.includeSystem) {
    const isUserSystem = Boolean(message.metadata?.is_user_system_message);
    if (!isUserSystem) return false;
  }

  if (parts.length === 0) {
    // Keep empty assistant/user shells that may mark branches, but skip empty system/root.
    if (role === "system") return false;
    return false;
  }

  return true;
}

function getPathIds(conversation: RawConversation): string[] {
  const mapping = conversation.mapping ?? {};
  const path: string[] = [];
  let nodeId: string | null | undefined = conversation.current_node;

  const seen = new Set<string>();
  while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
    seen.add(nodeId);
    path.push(nodeId);
    nodeId = mapping[nodeId].parent;
  }

  return path.reverse();
}

function depthFromRoot(
  nodeId: string,
  mapping: Record<string, MappingNode>,
  cache: Map<string, number>,
): number {
  const cached = cache.get(nodeId);
  if (cached !== undefined) return cached;

  const seen = new Set<string>();
  let depth = 0;
  let current: string | null | undefined = nodeId;

  while (current && mapping[current]?.parent && !seen.has(current)) {
    seen.add(current);
    depth += 1;
    current = mapping[current].parent;
  }

  cache.set(nodeId, depth);
  return depth;
}

export function flattenConversation(
  conversation: RawConversation,
  options: { includeSystem?: boolean } = {},
): ParsedConversation {
  const includeSystem = options.includeSystem ?? false;
  const mapping = conversation.mapping ?? {};
  const pathIds = getPathIds(conversation);
  const pathSet = new Set(pathIds);
  const depthCache = new Map<string, number>();

  const toDisplay = (nodeId: string): DisplayMessage | null => {
    const node = mapping[nodeId];
    const message = node?.message;
    if (!message) return null;

    const parts = extractParts(message);
    if (!shouldIncludeMessage(message, parts, { includeSystem })) return null;

    const parentId = node.parent ?? null;
    const siblings =
      parentId && mapping[parentId]?.children
        ? mapping[parentId].children!.filter((id) => {
            const sibling = mapping[id]?.message;
            if (!sibling) return false;
            const siblingParts = extractParts(sibling);
            return shouldIncludeMessage(sibling, siblingParts, { includeSystem });
          })
        : [nodeId];

    const branchIndex = Math.max(0, siblings.indexOf(nodeId));
    const modelSlug =
      (typeof message.metadata?.model_slug === "string"
        ? message.metadata.model_slug
        : null) ?? conversation.default_model_slug;

    return {
      id: nodeId,
      role: message.author?.role ?? "unknown",
      authorName: message.author?.name,
      createTime: message.create_time ?? null,
      parts,
      text: messageText(parts),
      modelSlug,
      status: message.status,
      onCurrentPath: pathSet.has(nodeId),
      branchIndex: siblings.length > 1 ? branchIndex : undefined,
      branchCount: siblings.length > 1 ? siblings.length : undefined,
      siblingIds: siblings.length > 1 ? siblings : undefined,
      parentId,
      depth: depthFromRoot(nodeId, mapping, depthCache),
    };
  };

  const currentPath = pathIds
    .map((id) => toDisplay(id))
    .filter((message): message is DisplayMessage => Boolean(message));

  const allMessages = Object.keys(mapping)
    .map((id) => toDisplay(id))
    .filter((message): message is DisplayMessage => Boolean(message))
    .sort((a, b) => {
      const at = a.createTime ?? 0;
      const bt = b.createTime ?? 0;
      if (at !== bt) return at - bt;
      return a.depth - b.depth;
    });

  const id =
    conversation.conversation_id ||
    conversation.id ||
    pathIds[pathIds.length - 1] ||
    `conversation-${Math.random().toString(36).slice(2)}`;

  return {
    id,
    title: conversation.title?.trim() || "Untitled conversation",
    createTime: conversation.create_time ?? null,
    updateTime: conversation.update_time ?? null,
    modelSlug: conversation.default_model_slug ?? null,
    gizmoId: conversation.gizmo_id ?? null,
    isArchived: conversation.is_archived,
    messageCount: allMessages.length,
    currentPathCount: currentPath.length,
    hiddenCount: Math.max(0, allMessages.length - currentPath.length),
    currentPath,
    allMessages,
    raw: conversation,
  };
}

export function parseConversationsJson(data: unknown): ParsedConversation[] {
  const list = normalizeConversationList(data);
  return list
    .map((conversation) => flattenConversation(conversation))
    .sort((a, b) => (b.updateTime ?? b.createTime ?? 0) - (a.updateTime ?? a.createTime ?? 0));
}

export function normalizeConversationList(data: unknown): RawConversation[] {
  if (Array.isArray(data)) {
    return data.filter(isConversationLike);
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.conversations)) {
      return record.conversations.filter(isConversationLike);
    }
    if (isConversationLike(record)) {
      return [record];
    }
  }

  throw new Error(
    "Unrecognized JSON shape. Expected conversations.json (an array of conversations).",
  );
}

function isConversationLike(value: unknown): value is RawConversation {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Boolean(record.mapping && typeof record.mapping === "object");
}

export function conversationMatchesQuery(
  conversation: ParsedConversation,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (conversation.title.toLowerCase().includes(q)) return true;
  if (conversation.modelSlug?.toLowerCase().includes(q)) return true;
  if (conversation.id.toLowerCase().includes(q)) return true;

  return conversation.allMessages.some(
    (message) =>
      message.text.toLowerCase().includes(q) ||
      message.role.toLowerCase().includes(q),
  );
}

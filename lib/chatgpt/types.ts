export type AuthorRole = "system" | "user" | "assistant" | "tool" | string

export type ContentPart =
  | string
  | {
      content_type?: string
      text?: string
      asset_pointer?: string
      [key: string]: unknown
    }

export interface ChatMessage {
  id?: string
  author?: { role?: AuthorRole; name?: string | null; metadata?: Record<string, unknown> }
  create_time?: number | null
  content?: { content_type?: string; parts?: ContentPart[]; text?: string; [key: string]: unknown } | null
  metadata?: Record<string, unknown>
}

export interface MappingNode {
  id?: string
  message?: ChatMessage | null
  parent?: string | null
  children?: string[]
}

export interface RawConversation {
  title?: string | null
  create_time?: number | null
  update_time?: number | null
  mapping?: Record<string, MappingNode>
  current_node?: string | null
  conversation_id?: string
  id?: string
  default_model_slug?: string | null
  [key: string]: unknown
}

export interface DisplayPart {
  kind: "text" | "code" | "image" | "other"
  text?: string
  language?: string
  label?: string
}

export interface DisplayMessage {
  id: string
  role: AuthorRole
  authorName?: string | null
  createTime?: number | null
  parts: DisplayPart[]
  text: string
  modelSlug?: string | null
  onCurrentPath: boolean
  branchIndex?: number
  branchCount?: number
}

export interface ParsedConversation {
  id: string
  title: string
  createTime?: number | null
  updateTime?: number | null
  modelSlug?: string | null
  messageCount: number
  currentPathCount: number
  hiddenCount: number
  currentPath: DisplayMessage[]
  allMessages: DisplayMessage[]
}

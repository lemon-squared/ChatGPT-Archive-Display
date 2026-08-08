export type AuthorRole = "system" | "user" | "assistant" | "tool" | string;

export type ContentPart =
  | string
  | {
      content_type?: string;
      text?: string;
      asset_pointer?: string;
      size_bytes?: number;
      width?: number;
      height?: number;
      fovea?: number;
      metadata?: Record<string, unknown>;
      [key: string]: unknown;
    };

export interface ChatMessageContent {
  content_type?: string;
  parts?: ContentPart[];
  text?: string;
  language?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id?: string;
  author?: {
    role?: AuthorRole;
    name?: string | null;
    metadata?: Record<string, unknown>;
  };
  create_time?: number | null;
  update_time?: number | null;
  content?: ChatMessageContent | null;
  status?: string;
  end_turn?: boolean | null;
  weight?: number;
  metadata?: Record<string, unknown>;
  recipient?: string;
  channel?: string | null;
}

export interface MappingNode {
  id?: string;
  message?: ChatMessage | null;
  parent?: string | null;
  children?: string[];
}

export interface RawConversation {
  title?: string | null;
  create_time?: number | null;
  update_time?: number | null;
  mapping?: Record<string, MappingNode>;
  current_node?: string | null;
  conversation_id?: string;
  id?: string;
  default_model_slug?: string | null;
  gizmo_id?: string | null;
  is_archived?: boolean;
  [key: string]: unknown;
}

export interface DisplayPart {
  kind: "text" | "code" | "image" | "other";
  text?: string;
  language?: string;
  label?: string;
}

export interface DisplayMessage {
  id: string;
  role: AuthorRole;
  authorName?: string | null;
  createTime?: number | null;
  parts: DisplayPart[];
  text: string;
  modelSlug?: string | null;
  status?: string;
  onCurrentPath: boolean;
  branchIndex?: number;
  branchCount?: number;
  siblingIds?: string[];
  parentId?: string | null;
  depth: number;
}

export interface ParsedConversation {
  id: string;
  title: string;
  createTime?: number | null;
  updateTime?: number | null;
  modelSlug?: string | null;
  gizmoId?: string | null;
  isArchived?: boolean;
  messageCount: number;
  currentPathCount: number;
  hiddenCount: number;
  currentPath: DisplayMessage[];
  allMessages: DisplayMessage[];
  raw: RawConversation;
}

export interface ArchiveBundle {
  sourceName: string;
  conversations: ParsedConversation[];
  loadedAt: number;
}

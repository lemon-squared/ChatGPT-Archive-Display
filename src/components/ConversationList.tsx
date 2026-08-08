"use client";

import type { ParsedConversation } from "@/lib/chatgpt/types";
import { formatShortDate, pluralize } from "@/lib/format";

interface ConversationListProps {
  conversations: ParsedConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  totalCount: number;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  totalCount,
}: ConversationListProps) {
  return (
    <aside className="flex max-h-[40vh] flex-col bg-[var(--sidebar)] lg:max-h-none">
      <div className="border-b border-[var(--line)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          Conversations
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Showing {conversations.length}
          {conversations.length !== totalCount ? ` of ${totalCount}` : ""}
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.map((conversation) => {
          const selected = conversation.id === selectedId;
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={[
                  "mb-1 w-full rounded-lg px-3 py-3 text-left transition",
                  selected
                    ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "hover:bg-[var(--surface-hover)] text-[var(--ink)]",
                ].join(" ")}
              >
                <span className="line-clamp-2 font-medium leading-snug">{conversation.title}</span>
                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-faint)]">
                  <span>{formatShortDate(conversation.updateTime ?? conversation.createTime)}</span>
                  <span aria-hidden>·</span>
                  <span>{pluralize(conversation.currentPathCount, "msg")}</span>
                  {conversation.hiddenCount > 0 ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="text-[var(--accent-strong)]">
                        +{conversation.hiddenCount} off-path
                      </span>
                    </>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

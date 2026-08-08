"use client";

import { useMemo } from "react";
import type { DisplayMessage, ParsedConversation } from "@/lib/chatgpt/types";
import { formatTimestamp, pluralize } from "@/lib/format";
import { MessageBubble } from "./MessageBubble";

interface MessageThreadProps {
  conversation: ParsedConversation;
  viewMode: "current" | "all";
  showHiddenOnly: boolean;
  query: string;
}

export function MessageThread({
  conversation,
  viewMode,
  showHiddenOnly,
  query,
}: MessageThreadProps) {
  const messages = useMemo(() => {
    let list: DisplayMessage[] =
      viewMode === "current" && !showHiddenOnly
        ? conversation.currentPath
        : conversation.allMessages;

    if (showHiddenOnly) {
      list = conversation.allMessages.filter((message) => !message.onCurrentPath);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      // Keep conversation-level matches intact; only filter messages when query looks message-specific
      // and title doesn't match.
      if (!conversation.title.toLowerCase().includes(q)) {
        const matched = list.filter((message) => message.text.toLowerCase().includes(q));
        if (matched.length > 0) list = matched;
      }
    }

    return list;
  }, [conversation, viewMode, showHiddenOnly, query]);

  return (
    <div className="flex h-full min-h-[50vh] flex-col">
      <div className="border-b border-[var(--line)] px-5 py-5 sm:px-8">
        <h1 className="font-display text-3xl leading-tight tracking-tight text-[var(--ink)] sm:text-4xl">
          {conversation.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--ink-muted)]">
          <span>Updated {formatTimestamp(conversation.updateTime ?? conversation.createTime)}</span>
          {conversation.modelSlug ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-mono text-[0.9em]">{conversation.modelSlug}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{pluralize(messages.length, "shown message")}</span>
          {conversation.hiddenCount > 0 ? (
            <>
              <span aria-hidden>·</span>
              <span className="text-[var(--accent-strong)]">
                {conversation.hiddenCount} not on current path
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--line)] px-4 py-10 text-center text-[var(--ink-muted)]">
            {showHiddenOnly
              ? "No off-path messages in this conversation — the export’s current path includes everything we could parse."
              : "No messages to display for this filter."}
          </p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={`${message.id}-${index}`}
              message={message}
              highlightOffPath={viewMode === "all" || showHiddenOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DisplayMessage } from "@/lib/chatgpt/types";
import { formatTimestamp } from "@/lib/format";

interface MessageBubbleProps {
  message: DisplayMessage;
  highlightOffPath?: boolean;
}

function roleLabel(message: DisplayMessage): string {
  if (message.role === "tool") {
    return message.authorName ? `tool · ${message.authorName}` : "tool";
  }
  return message.role;
}

export function MessageBubble({ message, highlightOffPath = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const offPath = highlightOffPath && !message.onCurrentPath;

  return (
    <article
      className={[
        "message-enter rounded-xl border px-4 py-4 sm:px-5",
        isUser
          ? "ml-0 border-[var(--user-border)] bg-[var(--user-bg)] sm:ml-8"
          : isAssistant
            ? "mr-0 border-[var(--assistant-border)] bg-[var(--assistant-bg)] sm:mr-8"
            : "border-[var(--tool-border)] bg-[var(--tool-bg)]",
        offPath ? "ring-2 ring-[var(--accent)]/35" : "",
      ].join(" ")}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        <span
          className={[
            "rounded px-1.5 py-0.5 font-semibold normal-case tracking-normal",
            isUser
              ? "bg-[var(--user-chip)] text-[var(--user-chip-text)]"
              : isAssistant
                ? "bg-[var(--assistant-chip)] text-[var(--assistant-chip-text)]"
                : "bg-[var(--tool-chip)] text-[var(--tool-chip-text)]",
          ].join(" ")}
        >
          {roleLabel(message)}
        </span>

        <span>{formatTimestamp(message.createTime)}</span>

        {message.modelSlug && isAssistant ? (
          <span className="font-mono normal-case tracking-normal opacity-80">{message.modelSlug}</span>
        ) : null}

        {message.branchCount && message.branchCount > 1 ? (
          <span className="rounded border border-[var(--line)] px-1.5 py-0.5 normal-case tracking-normal text-[var(--accent-strong)]">
            branch {(message.branchIndex ?? 0) + 1}/{message.branchCount}
          </span>
        ) : null}

        {offPath ? (
          <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 normal-case tracking-normal text-[var(--accent-strong)]">
            off current path
          </span>
        ) : null}
      </header>

      <div className="prose-archive space-y-3 text-[0.98rem] leading-relaxed text-[var(--ink)]">
        {message.parts.map((part, index) => {
          if (part.kind === "image") {
            return (
              <p
                key={index}
                className="rounded-md border border-dashed border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink-muted)]"
              >
                Image reference: <span className="font-mono break-all">{part.label}</span>
              </p>
            );
          }

          if (part.kind === "code") {
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-lg bg-[var(--code-bg)] p-3 text-sm text-[var(--code-fg)]"
              >
                <code>{part.text}</code>
              </pre>
            );
          }

          if (part.kind === "other") {
            return (
              <details key={index} className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
                <summary className="cursor-pointer text-[var(--ink-muted)]">{part.label || "Other content"}</summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs">{part.text}</pre>
              </details>
            );
          }

          return (
            <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
              {part.text || ""}
            </ReactMarkdown>
          );
        })}
      </div>
    </article>
  );
}

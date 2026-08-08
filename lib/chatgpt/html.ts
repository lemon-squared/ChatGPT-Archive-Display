import { conversationMatchesQuery } from "./parse.ts"
import type { ArchiveBundle } from "./load-archive.ts"
import type { DisplayMessage, DisplayPart } from "./types.ts"

export type ViewerState = {
  loading: boolean
  error: string | null
  bundle: ArchiveBundle | null
  query: string
  selectedId: string | null
  viewMode: "current" | "all"
  showHiddenOnly: boolean
}

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function formatTimestamp(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Unknown date"
  const ms = value > 1e12 ? value : value * 1000
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(ms),
  )
}

export function formatShortDate(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  const ms = value > 1e12 ? value : value * 1000
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms))
}

function renderMarkdownLite(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(/```([\s\S]*?)```/g, (_, code: string) => `<pre><code>${code}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\n\n/g, "</p><p>")
  html = html.replace(/\n/g, "<br>")
  return `<p>${html}</p>`
}

export function renderParts(parts: DisplayPart[]): string {
  return parts
    .map((part) => {
      if (part.kind === "image") {
        return `<p class="code" style="background:#faf7f0;color:#4d5a53;border:1px dashed #d5cdbc">Image reference: <span style="font-family:monospace;word-break:break-all">${escapeHtml(part.label)}</span></p>`
      }
      if (part.kind === "code") {
        return `<pre class="code"><code>${escapeHtml(part.text || "")}</code></pre>`
      }
      if (part.kind === "other") {
        return `<details><summary>${escapeHtml(part.label || "Other")}</summary><pre class="code">${escapeHtml(part.text || "")}</pre></details>`
      }
      return `<div class="body">${renderMarkdownLite(part.text || "")}</div>`
    })
    .join("")
}

export function renderLanding(state: ViewerState, sampleUrl: string | null): string {
  return `
      <div class="landing">
        <div class="atmosphere" aria-hidden="true"></div>
        <div class="blob-a" aria-hidden="true"></div>
        <div class="blob-b" aria-hidden="true"></div>
        <div class="wrap">
          <h1 class="font-display brand">Viewer</h1>
          <p class="lede">
            Drop your ChatGPT export ZIP or <code>conversations.json</code>. Parsing stays in this
            tab — Atlas bundled this island (and JSZip) for the browser.
          </p>
          <label class="drop${state.loading ? " active" : ""}" data-drop>
            <strong>${state.loading ? "Reading export…" : "Drop export here"}</strong>
            <span>or click to choose a <b>.zip</b> / <b>conversations.json</b></span>
            <input class="hidden-input" data-file type="file" accept=".zip,.json,application/zip,application/json" />
          </label>
          ${sampleUrl ? `<p class="hint"><button type="button" data-sample class="file-btn">Load sample conversation</button></p>` : ""}
          ${state.error ? `<p class="error" role="alert">${escapeHtml(state.error)}</p>` : ""}
          <p class="hint">Nothing is uploaded. Refreshing clears the in-memory archive.</p>
        </div>
      </div>
    `
}

export function renderViewer(state: ViewerState & { bundle: ArchiveBundle }): string {
  const bundle = state.bundle
  const filtered = bundle.conversations.filter((conversation) =>
    conversationMatchesQuery(conversation, state.query),
  )
  const selected =
    filtered.find((conversation) => conversation.id === state.selectedId) ?? filtered[0] ?? null
  const hiddenTotal = bundle.conversations.reduce(
    (sum, conversation) => sum + conversation.hiddenCount,
    0,
  )

  let messages: DisplayMessage[] = []
  if (selected) {
    messages =
      state.viewMode === "current" && !state.showHiddenOnly
        ? selected.currentPath
        : selected.allMessages
    if (state.showHiddenOnly) messages = selected.allMessages.filter((message) => !message.onCurrentPath)
    const q = state.query.trim().toLowerCase()
    if (q && !selected.title.toLowerCase().includes(q)) {
      const matched = messages.filter((message) => message.text.toLowerCase().includes(q))
      if (matched.length) messages = matched
    }
  }

  return `
      <div class="shell">
        <header class="chrome">
          <button type="button" class="brand-btn font-display" data-reset>Chat Archive</button>
          <span class="meta">${escapeHtml(bundle.sourceName)} · ${bundle.conversations.length} chats${hiddenTotal ? ` · ${hiddenTotal} off-path msgs` : ""}</span>
          <input type="search" placeholder="Search titles and message text…" value="${escapeHtml(state.query)}" data-query />
          <div class="seg">
            <button type="button" data-mode="current" class="${state.viewMode === "current" ? "on" : ""}">Current path</button>
            <button type="button" data-mode="all" class="${state.viewMode === "all" ? "on" : ""}">All nodes</button>
          </div>
          <label class="check"><input type="checkbox" data-hidden ${state.showHiddenOnly ? "checked" : ""} /> Off-path only</label>
          <label class="file-btn">Replace file<input class="hidden-input" data-file type="file" accept=".zip,.json,application/zip,application/json" /></label>
        </header>
        ${state.error ? `<p class="error" role="alert" style="margin:1rem">${escapeHtml(state.error)}</p>` : ""}
        <div class="layout">
          <aside class="sidebar">
            <div class="side-h">
              <p class="label">Conversations</p>
              <p class="count">Showing ${filtered.length}${filtered.length !== bundle.conversations.length ? ` of ${bundle.conversations.length}` : ""}</p>
            </div>
            ${filtered
              .map(
                (conversation) => `
              <button type="button" class="conv${selected?.id === conversation.id ? " on" : ""}" data-select="${escapeHtml(conversation.id)}">
                <div class="title">${escapeHtml(conversation.title)}</div>
                <div class="sub">
                  <span>${formatShortDate(conversation.updateTime ?? conversation.createTime)}</span>
                  <span>·</span>
                  <span>${conversation.currentPathCount} msg</span>
                  ${conversation.hiddenCount ? `<span class="off">· +${conversation.hiddenCount} off-path</span>` : ""}
                </div>
              </button>`,
              )
              .join("")}
          </aside>
          <section>
            ${
              selected
                ? `
              <div class="thread-h">
                <h2>${escapeHtml(selected.title)}</h2>
                <div class="meta">
                  <span>Updated ${formatTimestamp(selected.updateTime ?? selected.createTime)}</span>
                  ${selected.modelSlug ? `<span>·</span><span style="font-family:monospace">${escapeHtml(selected.modelSlug)}</span>` : ""}
                  <span>·</span><span>${messages.length} shown</span>
                  ${selected.hiddenCount ? `<span class="off">· ${selected.hiddenCount} not on current path</span>` : ""}
                </div>
              </div>
              <div class="msgs">
                ${
                  messages.length === 0
                    ? `<p class="empty">${state.showHiddenOnly ? "No off-path messages in this conversation." : "No messages to display for this filter."}</p>`
                    : messages
                        .map((message) => {
                          const off =
                            (state.viewMode === "all" || state.showHiddenOnly) && !message.onCurrentPath
                          const roleClass =
                            message.role === "user"
                              ? "user"
                              : message.role === "tool"
                                ? "tool"
                                : "assistant"
                          const roleLabel =
                            message.role === "tool" && message.authorName
                              ? `tool · ${message.authorName}`
                              : message.role
                          return `
                          <article class="msg ${roleClass}${off ? " offpath" : ""}">
                            <header class="msg-h">
                              <span class="chip ${roleClass}">${escapeHtml(roleLabel)}</span>
                              <span>${formatTimestamp(message.createTime)}</span>
                              ${message.modelSlug && message.role === "assistant" ? `<span style="font-family:monospace;letter-spacing:0;text-transform:none">${escapeHtml(message.modelSlug)}</span>` : ""}
                              ${message.branchCount && message.branchCount > 1 ? `<span class="badge">branch ${(message.branchIndex ?? 0) + 1}/${message.branchCount}</span>` : ""}
                              ${off ? `<span class="badge soft">off current path</span>` : ""}
                            </header>
                            ${renderParts(message.parts)}
                          </article>`
                        })
                        .join("")
                }
              </div>`
                : `<p class="empty">${state.query ? `No conversations match “${escapeHtml(state.query)}”.` : "Select a conversation to read it."}</p>`
            }
          </section>
        </div>
      </div>
    `
}

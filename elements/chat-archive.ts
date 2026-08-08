/**
 * <chat-archive> — ChatGPT export viewer island (client-only).
 * Parses ZIP / conversations.json in-browser and surfaces off-path messages.
 *
 * Served as a raw module by Atlas; keep syntax browser-safe (no type annotations).
 */

import JSZip from "https://esm.sh/jszip@3.10.1"

const SAMPLE_FIXTURE = String.raw`[{"title":"Branch demo — missing reply","create_time":1700000000,"update_time":1700001000,"conversation_id":"sample-conv-1","default_model_slug":"gpt-4o","current_node":"a2","mapping":{"root":{"id":"root","parent":null,"children":["u1"],"message":{"id":"root","author":{"role":"system"},"content":{"content_type":"text","parts":[""]}}},"u1":{"id":"u1","parent":"root","children":["a1","a2"],"message":{"id":"u1","author":{"role":"user"},"create_time":1700000001,"content":{"content_type":"text","parts":["What is the capital of France?"]}}},"a1":{"id":"a1","parent":"u1","children":[],"message":{"id":"a1","author":{"role":"assistant"},"create_time":1700000002,"content":{"content_type":"text","parts":["Paris — this regenerated branch is **off the current path** and often looks “missing” in the ChatGPT sidebar thread."]},"metadata":{"model_slug":"gpt-4o"}}},"a2":{"id":"a2","parent":"u1","children":[],"message":{"id":"a2","author":{"role":"assistant"},"create_time":1700000003,"content":{"content_type":"text","parts":["The capital of France is **Paris**.\n\n```js\nconsole.log('bonjour');\n```"]},"metadata":{"model_slug":"gpt-4o"}}}}}]`

const STYLE = `
:host { display: block; min-height: 100dvh; color: #1c241f; font-family: "Public Sans", "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
.font-display { font-family: "Fraunces", "Times New Roman", serif; font-optical-sizing: auto; }
.shell { min-height: 100dvh; background: #f3eee4; }
.landing { position: relative; overflow: hidden; min-height: 100dvh; display: flex; align-items: center; }
.atmosphere {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(160deg, rgba(243,238,228,.92), rgba(232,239,234,.88)),
    radial-gradient(ellipse 80% 60% at 10% 20%, rgba(45,122,110,.16), transparent 55%),
    radial-gradient(ellipse 70% 50% at 90% 80%, rgba(196,140,74,.14), transparent 50%),
    repeating-linear-gradient(-12deg, rgba(28,36,31,.025) 0 1px, transparent 1px 14px);
}
.blob-a, .blob-b { position: absolute; border-radius: 9999px; filter: blur(28px); pointer-events: none; }
.blob-a { left: -6rem; top: 4rem; width: 18rem; height: 18rem; background: radial-gradient(circle, rgba(45,122,110,.28), transparent 70%); }
.blob-b { right: -4rem; bottom: 2rem; width: 20rem; height: 20rem; background: radial-gradient(circle, rgba(196,140,74,.18), transparent 70%); }
.wrap { position: relative; width: min(64rem, 100%); margin: 0 auto; padding: 4rem 1.5rem; }
h1.brand { margin: 0; font-size: clamp(2.75rem, 8vw, 4.5rem); letter-spacing: -0.03em; line-height: 1.05; }
.lede { margin: 1.25rem 0 0; max-width: 36rem; font-size: 1.15rem; line-height: 1.6; color: #4d5a53; }
.lede code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: .95em; }
.drop {
  margin-top: 2.5rem; max-width: 42rem; display: flex; flex-direction: column; gap: .75rem;
  min-height: 12rem; padding: 2rem 1.5rem; border: 1px solid #b9ae97; border-radius: 0.75rem;
  background: rgba(250,247,240,.85); cursor: pointer; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  box-shadow: 0 20px 60px -40px rgba(20,36,32,.55);
}
.drop:hover, .drop.active { border-color: #2d7a6e; transform: translateY(-2px); }
.drop.active { background: rgba(45,122,110,.14); }
.drop strong { font-family: "Fraunces", serif; font-size: 1.5rem; }
.drop span { color: #4d5a53; }
.hint { margin-top: 2rem; color: #7a877f; font-size: .9rem; }
.error { margin-top: 1rem; max-width: 42rem; padding: .75rem 1rem; border-radius: .5rem; border: 1px solid #e2b4ae; background: #f8e8e6; color: #8b2e2e; font-size: .9rem; }
.chrome {
  position: sticky; top: 0; z-index: 20; border-bottom: 1px solid #d5cdbc;
  background: rgba(243,238,228,.9); backdrop-filter: blur(10px);
  display: flex; flex-wrap: wrap; gap: .75rem 1rem; align-items: center; padding: .75rem 1.25rem;
}
.chrome .brand-btn { background: none; border: 0; cursor: pointer; font-family: "Fraunces", serif; font-size: 1.25rem; color: #1c241f; }
.chrome .meta { color: #7a877f; font-size: .85rem; }
.chrome input[type="search"] {
  flex: 1; min-width: 12rem; border: 1px solid #d5cdbc; border-radius: .5rem; padding: .5rem .75rem;
  background: #faf7f0; color: #1c241f; outline: none;
}
.chrome input[type="search"]:focus { border-color: #2d7a6e; box-shadow: 0 0 0 2px rgba(45,122,110,.25); }
.seg { display: inline-flex; border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: 2px; }
.seg button {
  border: 0; background: transparent; color: #4d5a53; border-radius: .35rem; padding: .4rem .7rem; cursor: pointer; font-size: .875rem;
}
.seg button.on { background: #1c241f; color: #f3eee4; }
.check { display: inline-flex; gap: .4rem; align-items: center; border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: .4rem .7rem; font-size: .875rem; color: #4d5a53; }
.file-btn { border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: .4rem .7rem; font-size: .875rem; cursor: pointer; }
.layout { display: grid; grid-template-columns: 1fr; min-height: calc(100dvh - 4.5rem); }
@media (min-width: 1024px) { .layout { grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); } }
.sidebar { background: #ebe4d6; max-height: 40vh; overflow: auto; border-bottom: 1px solid #d5cdbc; }
@media (min-width: 1024px) { .sidebar { max-height: none; border-bottom: 0; border-right: 1px solid #d5cdbc; } }
.side-h { padding: .75rem 1rem; border-bottom: 1px solid #d5cdbc; }
.side-h p { margin: 0; }
.side-h .label { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: #7a877f; font-weight: 600; }
.side-h .count { margin-top: .25rem; font-size: .875rem; color: #4d5a53; }
.conv {
  width: 100%; text-align: left; border: 0; background: transparent; cursor: pointer;
  padding: .75rem; margin: 0 .5rem .25rem; border-radius: .6rem; color: #1c241f;
}
.conv:hover { background: #e7dfd0; }
.conv.on { background: rgba(45,122,110,.14); }
.conv .title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 600; line-height: 1.35; }
.conv .sub { margin-top: .4rem; font-size: .75rem; color: #7a877f; display: flex; flex-wrap: wrap; gap: .35rem .5rem; }
.conv .off { color: #1f5f56; }
.thread-h { padding: 1.25rem 1.5rem; border-bottom: 1px solid #d5cdbc; }
.thread-h h2 { margin: 0; font-family: "Fraunces", serif; font-size: clamp(1.6rem, 3vw, 2.2rem); letter-spacing: -0.02em; line-height: 1.15; }
.thread-h .meta { margin-top: .75rem; display: flex; flex-wrap: wrap; gap: .35rem .75rem; color: #4d5a53; font-size: .9rem; }
.thread-h .off { color: #1f5f56; }
.msgs { padding: 1.25rem 1rem 2rem; display: flex; flex-direction: column; gap: 1.1rem; }
@media (min-width: 640px) { .msgs { padding-left: 2rem; padding-right: 2rem; } }
.msg { border-radius: .75rem; border: 1px solid #ddd4c3; background: #fffdf8; padding: 1rem 1.1rem; animation: rise .42s cubic-bezier(.22,1,.36,1) both; }
.msg.user { border-color: #c5d9d2; background: #e8f1ee; }
.msg.tool { border-color: #d2c7b2; background: #f1ebe0; }
.msg.offpath { box-shadow: 0 0 0 2px rgba(45,122,110,.35); }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.msg-h { display: flex; flex-wrap: wrap; gap: .4rem .6rem; align-items: center; margin-bottom: .75rem; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: #7a877f; }
.chip { border-radius: .3rem; padding: .15rem .45rem; font-weight: 700; letter-spacing: 0; text-transform: none; font-size: .75rem; }
.chip.user { background: #2d7a6e; color: #f4faf8; }
.chip.assistant { background: #3c3428; color: #f7f2e8; }
.chip.tool { background: #8a6a32; color: #fff8ea; }
.badge { border: 1px solid #d5cdbc; border-radius: .3rem; padding: .1rem .4rem; color: #1f5f56; letter-spacing: 0; text-transform: none; }
.badge.soft { background: rgba(45,122,110,.14); border: 0; }
.body { font-size: .98rem; line-height: 1.65; }
.body p { margin: .65em 0; }
.body p:first-child { margin-top: 0; }
.body p:last-child { margin-bottom: 0; }
.body pre, .code {
  overflow-x: auto; border-radius: .6rem; background: #24302b; color: #e8f0ec;
  padding: .85rem 1rem; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: .88rem;
}
.body code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: .9em; background: rgba(28,36,31,.06); border-radius: .3rem; padding: .1rem .35rem; }
.body pre code { background: none; padding: 0; }
.body ul, .body ol { padding-left: 1.25rem; }
.body a { color: #1f5f56; }
.empty { margin: 2rem; padding: 2.5rem 1rem; text-align: center; color: #4d5a53; border: 1px dashed #d5cdbc; border-radius: .75rem; }
.hidden-input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
`

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function formatTimestamp(value) {
  if (value == null || Number.isNaN(value)) return "Unknown date"
  const ms = value > 1e12 ? value : value * 1000
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(ms))
}

function formatShortDate(value) {
  if (value == null || Number.isNaN(value)) return "—"
  const ms = value > 1e12 ? value : value * 1000
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(ms))
}

function partToDisplay(part) {
  if (typeof part === "string") {
    if (!part.trim()) return null
    return { kind: "text", text: part }
  }
  if (!part || typeof part !== "object") return null
  const contentType = typeof part.content_type === "string" ? part.content_type : ""
  if (contentType === "image_asset_pointer" || part.asset_pointer) {
    return { kind: "image", label: String(part.asset_pointer || "Image attachment"), text: String(part.asset_pointer || "") }
  }
  if (contentType === "code" || part.language) {
    const text = typeof part.text === "string" ? part.text : ""
    if (!text.trim()) return null
    return { kind: "code", text, language: part.language || undefined }
  }
  const text = typeof part.text === "string" ? part.text : ""
  if (text.trim()) return { kind: "text", text }
  if (contentType) return { kind: "other", label: contentType, text: JSON.stringify(part) }
  return null
}

function extractParts(message) {
  if (!message?.content) return []
  const content = message.content
  const parts = []
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

function messageText(parts) {
  return parts.map((part) => part.text || part.label || "").filter(Boolean).join("\n\n")
}

function shouldIncludeMessage(message, parts) {
  const role = message.author?.role ?? "unknown"
  if (role === "system") {
    const isUserSystem = Boolean(message.metadata?.is_user_system_message)
    if (!isUserSystem) return false
  }
  return parts.length > 0
}

function getPathIds(conversation) {
  const mapping = conversation.mapping ?? {}
  const path = []
  let nodeId = conversation.current_node
  const seen = new Set()
  while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
    seen.add(nodeId)
    path.push(nodeId)
    nodeId = mapping[nodeId].parent
  }
  return path.reverse()
}

function flattenConversation(conversation) {
  const mapping = conversation.mapping ?? {}
  const pathIds = getPathIds(conversation)
  const pathSet = new Set(pathIds)

  const toDisplay = (nodeId) => {
    const node = mapping[nodeId]
    const message = node?.message
    if (!message) return null
    const parts = extractParts(message)
    if (!shouldIncludeMessage(message, parts)) return null
    const parentId = node.parent ?? null
    const siblings =
      parentId && mapping[parentId]?.children
        ? mapping[parentId].children.filter((id) => {
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
      depth: 0,
    }
  }

  const currentPath = pathIds.map(toDisplay).filter(Boolean)
  const allMessages = Object.keys(mapping)
    .map(toDisplay)
    .filter(Boolean)
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

function normalizeConversationList(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object" && value.mapping)
  if (data && typeof data === "object") {
    if (Array.isArray(data.conversations)) {
      return data.conversations.filter((value) => value && typeof value === "object" && value.mapping)
    }
    if (data.mapping) return [data]
  }
  throw new Error("Unrecognized JSON shape. Expected conversations.json (an array of conversations).")
}

function parseConversationsJson(data) {
  return normalizeConversationList(data)
    .map(flattenConversation)
    .sort((a, b) => (b.updateTime ?? b.createTime ?? 0) - (a.updateTime ?? a.createTime ?? 0))
}

async function parseZip(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const names = Object.keys(zip.files)
  const entry =
    zip.file("conversations.json") ||
    names.filter((name) => name.toLowerCase().endsWith("conversations.json")).map((name) => zip.file(name)).find(Boolean)
  if (!entry) {
    if (names.some((name) => name.toLowerCase().endsWith("chat.html"))) {
      throw new Error("Found chat.html but no conversations.json.")
    }
    throw new Error("No conversations.json found inside the ZIP.")
  }
  return parseConversationsJson(JSON.parse(await entry.async("string")))
}

async function loadArchiveFile(file) {
  const lower = file.name.toLowerCase()
  let conversations
  if (lower.endsWith(".zip")) conversations = await parseZip(file)
  else if (lower.endsWith(".json")) conversations = parseConversationsJson(JSON.parse(await file.text()))
  else {
    try {
      conversations = parseConversationsJson(JSON.parse(await file.text()))
    } catch {
      conversations = await parseZip(file)
    }
  }
  if (!conversations.length) throw new Error("No conversations found in that file.")
  return { sourceName: file.name, conversations }
}

function matchesQuery(conversation, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (conversation.title.toLowerCase().includes(q)) return true
  if (conversation.modelSlug?.toLowerCase().includes(q)) return true
  return conversation.allMessages.some((message) => message.text.toLowerCase().includes(q))
}

function renderMarkdownLite(text) {
  let html = escapeHtml(text)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\n\n/g, "</p><p>")
  html = html.replace(/\n/g, "<br>")
  return `<p>${html}</p>`
}

function renderParts(parts) {
  return parts
    .map((part) => {
      if (part.kind === "image") {
        return `<p class="code" style="background:#faf7f0;color:#4d5a53;border:1px dashed #d5cdbc">Image reference: <span style="font-family:monospace;word-break:break-all">${escapeHtml(part.label)}</span></p>`
      }
      if (part.kind === "code") return `<pre class="code"><code>${escapeHtml(part.text || "")}</code></pre>`
      if (part.kind === "other") {
        return `<details><summary>${escapeHtml(part.label || "Other")}</summary><pre class="code">${escapeHtml(part.text || "")}</pre></details>`
      }
      return `<div class="body">${renderMarkdownLite(part.text || "")}</div>`
    })
    .join("")
}

class ChatArchive extends HTMLElement {
  #root
  #state = {
    loading: false,
    error: null,
    bundle: null,
    query: "",
    selectedId: null,
    viewMode: "current",
    showHiddenOnly: false,
  }

  constructor() {
    super()
    this.#root = this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    this.render()
  }

  setState(patch) {
    this.#state = { ...this.#state, ...patch }
    this.render()
  }

  async onFiles(fileList) {
    const file = fileList?.[0]
    if (!file) return
    this.setState({ loading: true, error: null })
    try {
      const bundle = await loadArchiveFile(file)
      this.setState({
        loading: false,
        bundle,
        selectedId: bundle.conversations[0]?.id ?? null,
        query: "",
        viewMode: "current",
        showHiddenOnly: false,
      })
    } catch (err) {
      this.setState({
        loading: false,
        bundle: null,
        selectedId: null,
        error: err instanceof Error ? err.message : "Failed to read that file.",
      })
    }
  }

  render() {
    const state = this.#state
    this.#root.innerHTML = `<style>${STYLE}</style>${state.bundle ? this.renderViewer(state) : this.renderLanding(state)}`
    this.bind(state)
  }

  renderLanding(state) {
    const sampleUrl = this.getAttribute("sample-url")
    return `
      <div class="landing">
        <div class="atmosphere" aria-hidden="true"></div>
        <div class="blob-a" aria-hidden="true"></div>
        <div class="blob-b" aria-hidden="true"></div>
        <div class="wrap">
          <h1 class="font-display brand">Chat Archive</h1>
          <p class="lede">
            Drop your ChatGPT export ZIP or <code>conversations.json</code> to recover every turn —
            including branched and “missing” messages the client may hide.
          </p>
          <label class="drop${state.loading ? " active" : ""}" data-drop>
            <strong>${state.loading ? "Reading export…" : "Drop export here"}</strong>
            <span>or click to choose a <b>.zip</b> / <b>conversations.json</b></span>
            <input class="hidden-input" data-file type="file" accept=".zip,.json,application/zip,application/json" />
          </label>
          ${sampleUrl ? `<p class="hint"><button type="button" data-sample class="file-btn">Load sample conversation</button></p>` : ""}
          ${state.error ? `<p class="error" role="alert">${escapeHtml(state.error)}</p>` : ""}
          <p class="hint">Everything stays in your browser. Nothing is uploaded. Built with Atlas.</p>
        </div>
      </div>
    `
  }

  renderViewer(state) {
    const bundle = state.bundle
    const filtered = bundle.conversations.filter((conversation) => matchesQuery(conversation, state.query))
    const selected = filtered.find((conversation) => conversation.id === state.selectedId) ?? filtered[0] ?? null
    const hiddenTotal = bundle.conversations.reduce((sum, conversation) => sum + conversation.hiddenCount, 0)

    let messages = []
    if (selected) {
      messages =
        state.viewMode === "current" && !state.showHiddenOnly ? selected.currentPath : selected.allMessages
      if (state.showHiddenOnly) messages = selected.allMessages.filter((message) => !message.onCurrentPath)
      const q = state.query.trim().toLowerCase()
      if (q && selected && !selected.title.toLowerCase().includes(q)) {
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
                          const off = (state.viewMode === "all" || state.showHiddenOnly) && !message.onCurrentPath
                          const roleClass = message.role === "user" ? "user" : message.role === "tool" ? "tool" : "assistant"
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
                              ${message.branchCount > 1 ? `<span class="badge">branch ${message.branchIndex + 1}/${message.branchCount}</span>` : ""}
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

  bind(state) {
    const fileInputs = this.#root.querySelectorAll("[data-file]")
    fileInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.files?.length) this.onFiles(input.files)
        input.value = ""
      })
    })

    const drop = this.#root.querySelector("[data-drop]")
    if (drop) {
      drop.addEventListener("dragenter", (event) => {
        event.preventDefault()
        drop.classList.add("active")
      })
      drop.addEventListener("dragover", (event) => {
        event.preventDefault()
        drop.classList.add("active")
      })
      drop.addEventListener("dragleave", (event) => {
        event.preventDefault()
        drop.classList.remove("active")
      })
      drop.addEventListener("drop", (event) => {
        event.preventDefault()
        drop.classList.remove("active")
        if (event.dataTransfer?.files?.length) this.onFiles(event.dataTransfer.files)
      })
    }

    this.#root.querySelector("[data-reset]")?.addEventListener("click", () => {
      this.setState({ bundle: null, selectedId: null, error: null, query: "" })
    })
    this.#root.querySelector("[data-query]")?.addEventListener("input", (event) => {
      this.setState({ query: event.target.value })
    })
    this.#root.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => this.setState({ viewMode: button.getAttribute("data-mode") }))
    })
    this.#root.querySelector("[data-hidden]")?.addEventListener("change", (event) => {
      const checked = event.target.checked
      this.setState({ showHiddenOnly: checked, viewMode: checked ? "all" : state.viewMode })
    })
    this.#root.querySelectorAll("[data-select]").forEach((button) => {
      button.addEventListener("click", () => this.setState({ selectedId: button.getAttribute("data-select") }))
    })

    this.#root.querySelector("[data-sample]")?.addEventListener("click", async () => {
      const sampleUrl = this.getAttribute("sample-url")
      if (!sampleUrl) return
      this.setState({ loading: true, error: null })
      try {
        // Prefer fetching; fall back to embedded fixture if public/ isn’t served.
        let text
        try {
          const res = await fetch(sampleUrl)
          if (!res.ok) throw new Error("sample fetch failed")
          text = await res.text()
        } catch {
          text = SAMPLE_FIXTURE
        }
        const conversations = parseConversationsJson(JSON.parse(text))
        this.setState({
          loading: false,
          bundle: { sourceName: "sample-conversations.json", conversations },
          selectedId: conversations[0]?.id ?? null,
          query: "",
          viewMode: "current",
          showHiddenOnly: false,
        })
      } catch (err) {
        this.setState({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load sample.",
        })
      }
    })
  }
}

if (!customElements.get("chat-archive")) {
  customElements.define("chat-archive", ChatArchive)
}

export {}

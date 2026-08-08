/**
 * <chat-archive> — ChatGPT export viewer island (client-only).
 *
 * Atlas discovers this file as the island entry (do not import it from page.tsx).
 * Helpers live in lib/chatgpt so they are not extra islands. Bun.build inlines them.
 *
 * Atlas records island npm deps from this file only (not transitive lib/ imports).
 */

import "jszip"

import sampleFixture from "../public/sample-conversations.json"
import { renderLanding, renderViewer, type ViewerState } from "../lib/chatgpt/html.ts"
import { loadArchiveFile } from "../lib/chatgpt/load-archive.ts"
import { parseConversationsJson } from "../lib/chatgpt/parse.ts"
import { CHAT_ARCHIVE_STYLES } from "../lib/chatgpt/styles.ts"

const SAMPLE_FIXTURE = JSON.stringify(sampleFixture)

class ChatArchive extends HTMLElement {
  #root: ShadowRoot
  #state: ViewerState = {
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

  setState(patch: Partial<ViewerState>) {
    this.#state = { ...this.#state, ...patch }
    this.render()
  }

  async onFiles(fileList: FileList | null | undefined) {
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
    const body = state.bundle
      ? renderViewer({ ...state, bundle: state.bundle })
      : renderLanding(state, this.getAttribute("sample-url"))
    this.#root.innerHTML = `<style>${CHAT_ARCHIVE_STYLES}</style>${body}`
    this.bind(state)
  }

  bind(state: ViewerState) {
    const fileInputs = this.#root.querySelectorAll<HTMLInputElement>("[data-file]")
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
        const drag = event as DragEvent
        if (drag.dataTransfer?.files?.length) this.onFiles(drag.dataTransfer.files)
      })
    }

    this.#root.querySelector("[data-reset]")?.addEventListener("click", () => {
      this.setState({ bundle: null, selectedId: null, error: null, query: "" })
    })
    this.#root.querySelector("[data-query]")?.addEventListener("input", (event) => {
      this.setState({ query: (event.target as HTMLInputElement).value })
    })
    this.#root.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () =>
        this.setState({ viewMode: button.getAttribute("data-mode") === "all" ? "all" : "current" }),
      )
    })
    this.#root.querySelector("[data-hidden]")?.addEventListener("change", (event) => {
      const checked = (event.target as HTMLInputElement).checked
      this.setState({ showHiddenOnly: checked, viewMode: checked ? "all" : state.viewMode })
    })
    this.#root.querySelectorAll("[data-select]").forEach((button) => {
      button.addEventListener("click", () =>
        this.setState({ selectedId: button.getAttribute("data-select") }),
      )
    })

    this.#root.querySelector("[data-sample]")?.addEventListener("click", async () => {
      const sampleUrl = this.getAttribute("sample-url")
      if (!sampleUrl) return
      this.setState({ loading: true, error: null })
      try {
        let text: string
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

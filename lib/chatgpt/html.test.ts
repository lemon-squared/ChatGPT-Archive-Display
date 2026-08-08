import { describe, expect, it } from "bun:test"
import { escapeHtml, renderLanding, renderParts } from "./html"

describe("escapeHtml", () => {
  it("escapes markup", () => {
    expect(escapeHtml(`<a href="x">`)).toBe("&lt;a href=&quot;x&quot;&gt;")
  })
})

describe("renderParts", () => {
  it("renders text and code", () => {
    const html = renderParts([
      { kind: "text", text: "Hello **world**" },
      { kind: "code", text: "const x = 1" },
    ])
    expect(html).toContain("<strong>world</strong>")
    expect(html).toContain("<pre class=\"code\">")
    expect(html).toContain("const x = 1")
  })
})

describe("renderLanding", () => {
  it("shows sample button when sample-url is set", () => {
    const html = renderLanding(
      {
        loading: false,
        error: null,
        bundle: null,
        query: "",
        selectedId: null,
        viewMode: "current",
        showHiddenOnly: false,
      },
      "/sample-conversations.json",
    )
    expect(html).toContain("data-sample")
    expect(html).toContain("Drop export here")
  })
})

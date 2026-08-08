# ChatGPT Archive Display

Browser-based viewer for ChatGPT data exports, built on **[Atlas](https://github.com/lemon-squared/Atlas)** (HTML-first) with **Tailwind** via `@atlas/tailwind` and **self-hosted fonts** via `@atlas/font`.

Drop a `.zip` export or `conversations.json` to browse conversations — including branched / regenerated turns the ChatGPT client may hide.

**Parsing stays in your browser. Nothing is uploaded.**

## Features

- Drag and drop ChatGPT export ZIP or `conversations.json`
- Reconstructs the current path from `mapping` + `current_node`
- **All nodes** / **Off-path only** for “missing” branch messages
- Search across titles and message text
- Atlas island (`<chat-archive>`) for client interactivity

## Requirements

- [Bun](https://bun.sh) ≥ 1.1
- Access to the private `lemon-squared/Atlas` repo until `@atlas/*` is published to npm

```bash
cp .env.example .env
# set ATLAS_GITHUB_TOKEN=...  (fine-grained PAT, Contents: Read on Atlas)

bun install                     # clones/updates vendor/Atlas when needed
bun run dev                     # http://localhost:3000
```

```bash
bun test
bun run islands   # bundle <chat-archive> + jszip into elements/
bun run build
```

Sample fixture: [`public/sample-conversations.json`](./public/sample-conversations.json).

## Stack

- Atlas (compiler, runtime, islands, `@atlas/tailwind`, `@atlas/font`)
- Bun
- JSZip (npm dependency, bundled into the island at build time — no CDN)

Fonts (Public Sans, Fraunces, IBM Plex Mono) are downloaded at `atlas build` into `.atlas/assets/fonts/` and served locally — no `fonts.googleapis.com` / `fonts.gstatic.com` requests.

## Privacy

Files never leave your machine for parsing. Refreshing clears the in-memory archive.

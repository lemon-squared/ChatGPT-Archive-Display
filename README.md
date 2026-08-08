# ChatGPT Archive Display

Browser-based viewer for ChatGPT data exports. Drop a `.zip` export or `conversations.json` to browse conversations with full message recovery — including branched / regenerated turns that the ChatGPT client may not show on the current path.

**Everything is parsed locally in your browser. Nothing is uploaded.**

## Features

- Drag and drop ChatGPT export ZIP or `conversations.json`
- Reconstructs the current conversation path from `mapping` + `current_node`
- **All nodes** and **Off-path only** views to surface “missing” messages from alternate branches
- Search across titles and message text
- Markdown rendering for assistant/user turns
- Tool / image-reference parts preserved

## Quick start

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
bun test
bun run build
```

## Export tips

In ChatGPT: **Settings → Data controls → Export data**. Unpack or upload the ZIP that contains `conversations.json`.

## Stack

- Bun (package manager, scripts, and tests)
- Next.js (App Router) + React
- Tailwind CSS v4
- JSZip (client-side ZIP reading)
- react-markdown + remark-gfm

> Note: Integration with the private **Atlas** framework is pending repository access for this Cloud Agent.

## Privacy

Files never leave your machine for parsing. Refreshing the page clears the in-memory archive.

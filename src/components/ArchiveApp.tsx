"use client";

import { startTransition, useCallback, useMemo, useState } from "react";
import { conversationMatchesQuery } from "@/lib/chatgpt/parse";
import { isSupportedArchiveFile, loadArchiveFile } from "@/lib/chatgpt/load-file";
import type { ArchiveBundle, ParsedConversation } from "@/lib/chatgpt/types";
import { pluralize } from "@/lib/format";
import { ConversationList } from "./ConversationList";
import { DropZone } from "./DropZone";
import { MessageThread } from "./MessageThread";
import { ViewerChrome } from "./ViewerChrome";

type ViewMode = "current" | "all";

export function ArchiveApp() {
  const [bundle, setBundle] = useState<ArchiveBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("current");
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  const onFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!isSupportedArchiveFile(file) && !file.name.includes(".")) {
      // allow extensionless attempts through the loader
    } else if (!isSupportedArchiveFile(file)) {
      setError("Please drop a ChatGPT export .zip or conversations.json file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const next = await loadArchiveFile(file);
      startTransition(() => {
        setBundle(next);
        setSelectedId(next.conversations[0]?.id ?? null);
        setQuery("");
        setViewMode("current");
        setShowHiddenOnly(false);
      });
    } catch (err) {
      setBundle(null);
      setSelectedId(null);
      setError(err instanceof Error ? err.message : "Failed to read that file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!bundle) return [] as ParsedConversation[];
    return bundle.conversations.filter((conversation) =>
      conversationMatchesQuery(conversation, query),
    );
  }, [bundle, query]);

  const selected = useMemo(
    () => filtered.find((conversation) => conversation.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const hiddenTotal = useMemo(
    () => bundle?.conversations.reduce((sum, conversation) => sum + conversation.hiddenCount, 0) ?? 0,
    [bundle],
  );

  if (!bundle) {
    return (
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-atmosphere" aria-hidden />
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(45,122,110,0.28),transparent_70%)] blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(196,140,74,0.18),transparent_70%)] blur-2xl" aria-hidden />

        <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
          <p className="font-display text-5xl tracking-tight text-[var(--ink)] sm:text-7xl">
            Chat Archive
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ink-muted)] sm:text-xl">
            Drop your ChatGPT export ZIP or <code className="font-mono text-[0.95em]">conversations.json</code> to
            recover every turn — including branched and “missing” messages the client may hide.
          </p>

          <div className="mt-10 max-w-2xl">
            <DropZone onFiles={onFiles} loading={loading} />
          </div>

          {error ? (
            <p className="mt-4 max-w-2xl rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}

          <p className="mt-8 max-w-2xl text-sm text-[var(--ink-faint)]">
            Everything stays in your browser. Nothing is uploaded.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--canvas)] text-[var(--ink)]">
      <ViewerChrome
        sourceName={bundle.sourceName}
        conversationCount={bundle.conversations.length}
        hiddenTotal={hiddenTotal}
        query={query}
        onQueryChange={setQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showHiddenOnly={showHiddenOnly}
        onShowHiddenOnlyChange={setShowHiddenOnly}
        onReset={() => {
          setBundle(null);
          setSelectedId(null);
          setError(null);
          setQuery("");
        }}
        onFiles={onFiles}
        loading={loading}
      />

      {error ? (
        <p className="mx-6 mt-3 rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)] sm:mx-8" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1400px] grid-cols-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        <ConversationList
          conversations={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          totalCount={bundle.conversations.length}
        />

        <section className="min-w-0 border-t border-[var(--line)] lg:border-l lg:border-t-0">
          {selected ? (
            <MessageThread
              conversation={selected}
              viewMode={viewMode}
              showHiddenOnly={showHiddenOnly}
              query={query}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 py-20 text-[var(--ink-muted)]">
              {query
                ? `No conversations match “${query}”.`
                : "Select a conversation to read it."}
            </div>
          )}
        </section>
      </div>

      <p className="sr-only">
        Loaded {pluralize(bundle.conversations.length, "conversation")} from {bundle.sourceName}.
      </p>
    </div>
  );
}

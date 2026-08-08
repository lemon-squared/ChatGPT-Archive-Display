"use client";

import { DropZone } from "./DropZone";

interface ViewerChromeProps {
  sourceName: string;
  conversationCount: number;
  hiddenTotal: number;
  query: string;
  onQueryChange: (value: string) => void;
  viewMode: "current" | "all";
  onViewModeChange: (mode: "current" | "all") => void;
  showHiddenOnly: boolean;
  onShowHiddenOnlyChange: (value: boolean) => void;
  onReset: () => void;
  onFiles: (files: FileList | File[]) => void;
  loading?: boolean;
}

export function ViewerChrome({
  sourceName,
  conversationCount,
  hiddenTotal,
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  showHiddenOnly,
  onShowHiddenOnlyChange,
  onReset,
  onFiles,
  loading,
}: ViewerChromeProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--canvas)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="font-display text-xl tracking-tight text-[var(--ink)] transition hover:text-[var(--accent-strong)]"
          >
            Chat Archive
          </button>
          <span className="hidden truncate text-sm text-[var(--ink-faint)] sm:inline">
            {sourceName} · {conversationCount} chats
            {hiddenTotal > 0 ? ` · ${hiddenTotal} off-path msgs` : ""}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search conversations</span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search titles and message text…"
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--accent)] transition placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:ring-2"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-[var(--line)] bg-[var(--surface)] p-0.5 text-sm">
              <button
                type="button"
                onClick={() => onViewModeChange("current")}
                className={[
                  "rounded px-2.5 py-1.5 transition",
                  viewMode === "current"
                    ? "bg-[var(--ink)] text-[var(--canvas)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                Current path
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("all")}
                className={[
                  "rounded px-2.5 py-1.5 transition",
                  viewMode === "all"
                    ? "bg-[var(--ink)] text-[var(--canvas)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                All nodes
              </button>
            </div>

            <label className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--ink-muted)]">
              <input
                type="checkbox"
                checked={showHiddenOnly}
                onChange={(event) => {
                  onShowHiddenOnlyChange(event.target.checked);
                  if (event.target.checked) onViewModeChange("all");
                }}
                className="accent-[var(--accent-strong)]"
              />
              Off-path only
            </label>

            <DropZone onFiles={onFiles} loading={loading} compact />
          </div>
        </div>
      </div>
    </header>
  );
}

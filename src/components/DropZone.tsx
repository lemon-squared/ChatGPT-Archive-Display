"use client";

import { useId, useState } from "react";

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  loading?: boolean;
  compact?: boolean;
}

export function DropZone({ onFiles, loading = false, compact = false }: DropZoneProps) {
  const inputId = useId();
  const [active, setActive] = useState(false);

  return (
    <label
      htmlFor={inputId}
      onDragEnter={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        if (event.dataTransfer.files?.length) onFiles(event.dataTransfer.files);
      }}
      className={[
        "group relative flex cursor-pointer flex-col items-start overflow-hidden border transition duration-300 ease-out",
        compact
          ? "rounded-md border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm hover:border-[var(--accent)]"
          : "min-h-48 rounded-xl border-[var(--line-strong)] bg-[var(--surface)]/80 px-6 py-8 shadow-[0_20px_60px_-40px_rgba(20,36,32,0.55)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_28px_70px_-36px_rgba(20,36,32,0.6)]",
        active ? "border-[var(--accent)] bg-[var(--accent-soft)] scale-[1.01]" : "",
        loading ? "pointer-events-none opacity-70" : "",
      ].join(" ")}
    >
      <input
        id={inputId}
        type="file"
        accept=".zip,.json,application/zip,application/json"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {!compact ? (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(45,122,110,0.12), transparent 40%)",
          }}
          aria-hidden
        />
      ) : null}

      <span className={compact ? "font-medium text-[var(--ink)]" : "font-display text-2xl text-[var(--ink)]"}>
        {loading ? "Reading export…" : compact ? "Replace file" : "Drop export here"}
      </span>
      {!compact ? (
        <span className="mt-3 text-[var(--ink-muted)]">
          or click to choose a <span className="text-[var(--ink)]">.zip</span> /{" "}
          <span className="text-[var(--ink)]">conversations.json</span>
        </span>
      ) : null}
    </label>
  );
}

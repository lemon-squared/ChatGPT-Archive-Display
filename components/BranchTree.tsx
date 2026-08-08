/** @jsxImportSource @atlas/renderer */

/** Decorative SSR visual: a conversation DAG with an off-path sibling. */
export function BranchTree() {
  return (
    <svg
      class="branch-tree"
      viewBox="0 0 640 420"
      role="img"
      aria-label="Diagram of a branched ChatGPT conversation with one off-path reply"
    >
      <defs>
        <linearGradient id="trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d7a6e" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#1f5f56" stop-opacity="0.55" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect width="640" height="420" fill="transparent" />

      {/* trunk path */}
      <path
        d="M120 60 C180 110, 200 150, 240 190 C280 230, 300 270, 340 320"
        stroke="url(#trunk)"
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
      />
      {/* off-path branch */}
      <path
        d="M240 190 C300 170, 360 150, 430 140"
        stroke="#b9ae97"
        stroke-width="3"
        stroke-dasharray="8 7"
        fill="none"
        stroke-linecap="round"
      />

      {/* nodes on current path */}
      <g>
        <rect x="72" y="36" width="118" height="48" rx="12" fill="#e8f1ee" stroke="#c5d9d2" />
        <text x="131" y="65" text-anchor="middle" class="node-label">
          User
        </text>

        <rect x="196" y="166" width="118" height="48" rx="12" fill="#fffdf8" stroke="#ddd4c3" />
        <text x="255" y="195" text-anchor="middle" class="node-label">
          Assistant
        </text>

        <rect x="296" y="296" width="118" height="48" rx="12" fill="#e8f1ee" stroke="#c5d9d2" />
        <text x="355" y="325" text-anchor="middle" class="node-label">
          User
        </text>
      </g>

      {/* off-path node */}
      <g>
        <rect
          x="392"
          y="112"
          width="148"
          height="56"
          rx="12"
          fill="#faf7f0"
          stroke="#2d7a6e"
          stroke-width="2"
          filter="url(#soft)"
        />
        <text x="466" y="138" text-anchor="middle" class="node-label accent">
          Off-path reply
        </text>
        <text x="466" y="156" text-anchor="middle" class="node-sub">
          still in the export
        </text>
      </g>

      <text x="120" y="400" class="node-sub">
        current_node path
      </text>
      <text x="430" y="400" class="node-sub accent">
        sibling branch kept in mapping
      </text>
    </svg>
  )
}

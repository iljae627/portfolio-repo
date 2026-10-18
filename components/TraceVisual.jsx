export default function TraceVisual({ small = false }) {
  return (
    <div
      className={small ? "trace-visual small" : "trace-visual"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 520" fill="none">
        <defs>
          <radialGradient id={small ? "glow-small" : "glow"}>
            <stop stopColor="#c7ed68" stopOpacity=".18" />
            <stop offset="1" stopColor="#c7ed68" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="300"
          cy="260"
          r="245"
          fill={`url(#${small ? "glow-small" : "glow"})`}
        />
        <g stroke="currentColor" strokeWidth=".75">
          {Array.from({ length: 22 }, (_, i) => {
            const r = 45 + i * 8;
            return (
              <ellipse
                key={i}
                cx="300"
                cy="260"
                rx={r}
                ry={r * 0.84}
                transform={`rotate(${i * 7} 300 260)`}
              />
            );
          })}
        </g>
        <path
          d="M0 260h600M300 0v520"
          stroke="currentColor"
          strokeOpacity=".12"
          strokeDasharray="3 7"
        />
        <g fill="#c5ee70">
          <circle cx="300" cy="260" r="5" />
          <circle cx="412" cy="148" r="4" />
          <circle cx="155" cy="332" r="4" />
        </g>
        <path
          d="M300 260l112-112h112M155 332l-50 45H30"
          stroke="#91a85b"
          strokeWidth="1"
        />
        <g fill="currentColor" fontFamily="monospace" fontSize="9">
          <text x="438" y="138">
            01 / TRACE
          </text>
          <text x="32" y="394">
            02 / ANALYZE
          </text>
          <text x="310" y="280">
            0x627
          </text>
        </g>
      </svg>
    </div>
  );
}

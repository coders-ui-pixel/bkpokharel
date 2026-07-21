export function SuccessIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Student celebrating exam success with a trophy"
    >
      <ellipse cx="200" cy="300" rx="150" ry="18" fill="var(--illus-shadow, #e2e8f0)" />
      <circle cx="120" cy="80" r="50" fill="var(--illus-accent, #22d3ee)" opacity="0.16" />
      <circle cx="310" cy="230" r="44" fill="var(--illus-primary, #4f46e5)" opacity="0.14" />

      {/* confetti */}
      <g fill="#f59e0b">
        <rect x="90" y="60" width="8" height="8" transform="rotate(20 94 64)" />
        <rect x="300" y="90" width="8" height="8" transform="rotate(-15 304 94)" />
        <rect x="330" y="150" width="8" height="8" transform="rotate(35 334 154)" />
      </g>
      <g fill="#22c55e">
        <circle cx="110" cy="130" r="5" />
        <circle cx="290" cy="60" r="5" />
        <circle cx="70" cy="180" r="5" />
      </g>
      <g fill="#4f46e5">
        <rect x="260" y="180" width="7" height="7" transform="rotate(10 263 183)" />
        <rect x="130" y="50" width="7" height="7" transform="rotate(-25 133 53)" />
      </g>

      {/* body jumping */}
      <rect x="165" y="150" width="70" height="88" rx="24" fill="#22c55e" />
      <circle cx="200" cy="118" r="34" fill="#fcd9b8" />
      <path d="M166 106 Q200 72 234 106 Q234 88 200 82 Q166 88 166 106 Z" fill="#1f2937" />

      {/* graduation cap */}
      <g transform="translate(160,66)">
        <path d="M40 0 L80 16 L40 32 L0 16 Z" fill="#1f2937" />
        <rect x="36" y="30" width="8" height="18" fill="#1f2937" />
        <circle cx="40" cy="48" r="4" fill="#f59e0b" />
      </g>

      {/* one arm raised holding trophy */}
      <path d="M170 168 Q140 150 138 118" stroke="#22c55e" strokeWidth="15" strokeLinecap="round" fill="none" />
      <g transform="translate(112,84)">
        <path d="M6 0 h28 v10 c0 14 -6 20 -14 20 c-8 0 -14 -6 -14 -20 Z" fill="#fbbf24" />
        <path d="M0 4 c-10 0 -10 20 8 20" stroke="#f59e0b" strokeWidth="4" fill="none" />
        <path d="M40 4 c10 0 10 20 -8 20" stroke="#f59e0b" strokeWidth="4" fill="none" />
        <rect x="14" y="30" width="12" height="10" fill="#f59e0b" />
        <rect x="6" y="40" width="28" height="8" rx="3" fill="#f59e0b" />
      </g>

      {/* other arm down */}
      <path d="M230 168 Q256 190 250 218" stroke="#22c55e" strokeWidth="15" strokeLinecap="round" fill="none" />

      {/* legs */}
      <path d="M180 230 L170 270" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
      <path d="M220 230 L230 270" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

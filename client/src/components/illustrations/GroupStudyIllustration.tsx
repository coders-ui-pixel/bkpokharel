export function GroupStudyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Two students studying together"
    >
      <ellipse cx="200" cy="300" rx="150" ry="18" fill="var(--illus-shadow, #e2e8f0)" />
      <circle cx="80" cy="90" r="44" fill="var(--illus-primary, #4f46e5)" opacity="0.14" />
      <circle cx="330" cy="200" r="46" fill="var(--illus-accent, #22d3ee)" opacity="0.16" />

      {/* shared table */}
      <rect x="70" y="230" width="260" height="16" rx="6" fill="#fde68a" />
      <rect x="90" y="246" width="16" height="36" fill="#fbbf24" />
      <rect x="294" y="246" width="16" height="36" fill="#fbbf24" />

      {/* stack of books on table */}
      <g transform="translate(178,196)">
        <rect x="0" y="18" width="70" height="14" rx="3" fill="#f87171" />
        <rect x="6" y="4" width="58" height="14" rx="3" fill="#60a5fa" />
        <rect x="12" y="-10" width="46" height="14" rx="3" fill="#34d399" />
      </g>

      {/* student left */}
      <g transform="translate(70,0)">
        <rect x="20" y="150" width="60" height="82" rx="22" fill="#4f46e5" />
        <circle cx="50" cy="122" r="32" fill="#fcd9b8" />
        <path d="M20 114 Q50 84 80 114 Q80 96 50 92 Q20 96 20 114 Z" fill="#3b2a1a" />
        <path d="M22 188 Q0 200 4 222" stroke="#4f46e5" strokeWidth="13" strokeLinecap="round" fill="none" />
      </g>

      {/* student right */}
      <g transform="translate(230,0)">
        <rect x="20" y="150" width="60" height="82" rx="22" fill="#f59e0b" />
        <circle cx="50" cy="122" r="32" fill="#e8b48a" />
        <path d="M20 118 Q50 154 80 118 L80 108 Q50 128 20 108 Z" fill="#1f2937" />
        <path d="M78 188 Q100 200 96 222" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" fill="none" />
      </g>

      {/* speech / idea bubble */}
      <g transform="translate(178,120)">
        <path d="M0 20 a26 22 0 1 1 44 0 a26 22 0 0 1 -18 20 l-4 14 l-8 -14 a26 22 0 0 1 -14 -20 Z" fill="white" stroke="#c4b5fd" strokeWidth="2" />
        <circle cx="12" cy="18" r="8" fill="#fde047" />
        <path d="M12 6 v-6 M2 10 l-5 -4 M22 10 l5 -4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

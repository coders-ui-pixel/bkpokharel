export function ReadingIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Student sitting cross-legged reading a book"
    >
      <ellipse cx="200" cy="300" rx="150" ry="18" fill="var(--illus-shadow, #e2e8f0)" />
      <circle cx="90" cy="80" r="46" fill="var(--illus-accent, #22d3ee)" opacity="0.18" />
      <circle cx="330" cy="230" r="60" fill="var(--illus-primary, #4f46e5)" opacity="0.12" />

      {/* plant */}
      <g transform="translate(300,190)">
        <rect x="-18" y="40" width="36" height="42" rx="8" fill="#c4b5fd" />
        <path d="M0 40 C -22 10, -30 -20, 0 -46 C 30 -20, 22 10, 0 40 Z" fill="#34d399" />
        <path d="M0 40 C 14 12, 18 -10, 6 -32" stroke="#059669" strokeWidth="3" fill="none" />
      </g>

      {/* floor cushion */}
      <ellipse cx="185" cy="280" rx="110" ry="24" fill="var(--illus-primary, #4f46e5)" opacity="0.15" />

      {/* legs crossed */}
      <path d="M120 250 Q185 300 250 250 L250 268 Q185 312 120 268 Z" fill="#fbbf24" />

      {/* body */}
      <rect x="150" y="150" width="70" height="100" rx="26" fill="#4f46e5" />

      {/* arms holding book */}
      <path d="M150 190 Q120 210 118 240" stroke="#4f46e5" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M220 190 Q250 210 252 240" stroke="#4f46e5" strokeWidth="16" strokeLinecap="round" fill="none" />

      {/* head */}
      <circle cx="185" cy="120" r="38" fill="#fcd9b8" />
      <path d="M147 108 Q185 70 223 108 Q223 88 185 82 Q147 88 147 108 Z" fill="#3b2a1a" />

      {/* book */}
      <g transform="translate(140,232)">
        <path d="M0 0 L45 -10 L90 0 L90 24 L45 14 L0 24 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <line x1="45" y1="-10" x2="45" y2="14" stroke="#f59e0b" strokeWidth="2" />
      </g>
    </svg>
  );
}

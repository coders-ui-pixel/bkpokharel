export function LaptopQuizIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 340"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Student taking an MCQ quiz on a laptop"
    >
      <ellipse cx="200" cy="300" rx="150" ry="18" fill="var(--illus-shadow, #e2e8f0)" />
      <circle cx="325" cy="90" r="50" fill="var(--illus-accent, #22d3ee)" opacity="0.16" />
      <circle cx="70" cy="240" r="40" fill="var(--illus-primary, #4f46e5)" opacity="0.12" />

      {/* desk */}
      <rect x="60" y="240" width="280" height="14" rx="6" fill="#c7d2fe" />
      <rect x="80" y="254" width="16" height="40" fill="#a5b4fc" />
      <rect x="304" y="254" width="16" height="40" fill="#a5b4fc" />

      {/* chair + body */}
      <rect x="165" y="150" width="70" height="90" rx="24" fill="#22d3ee" />
      <circle cx="200" cy="118" r="36" fill="#fcd9b8" />
      <path d="M166 108 Q200 74 234 108 Q234 90 200 84 Q166 90 166 108 Z" fill="#1f2937" />

      {/* arms typing */}
      <path d="M170 190 Q150 210 165 228" stroke="#22d3ee" strokeWidth="15" strokeLinecap="round" fill="none" />
      <path d="M230 190 Q250 210 235 228" stroke="#22d3ee" strokeWidth="15" strokeLinecap="round" fill="none" />

      {/* laptop */}
      <g transform="translate(140,190)">
        <rect x="0" y="0" width="120" height="72" rx="6" fill="#1e293b" />
        <rect x="6" y="6" width="108" height="60" rx="3" fill="#f8fafc" />
        {/* MCQ options on screen */}
        <rect x="14" y="14" width="70" height="6" rx="3" fill="#94a3b8" />
        <circle cx="18" cy="30" r="5" fill="#4f46e5" />
        <rect x="28" y="27" width="60" height="6" rx="3" fill="#cbd5e1" />
        <circle cx="18" cy="44" r="5" fill="#22c55e" />
        <rect x="28" y="41" width="50" height="6" rx="3" fill="#cbd5e1" />
        <path d="M13 44 l3 3 l6 -7" stroke="white" strokeWidth="1.6" fill="none" />
        <circle cx="18" cy="58" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.4" />
        <rect x="28" y="55" width="40" height="6" rx="3" fill="#e2e8f0" />

        <path d="M-6 72 L0 88 L120 88 L126 72 Z" fill="#334155" />
      </g>

      {/* floating checkmark badge */}
      <g transform="translate(300,150)">
        <circle r="24" fill="#22c55e" />
        <path d="M-10 0 L-3 8 L12 -10" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

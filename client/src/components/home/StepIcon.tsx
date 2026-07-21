export function StepIcon({ step }: { step: 1 | 2 | 3 }) {
  return (
    <svg viewBox="0 0 64 48" className="step-card__icon" fill="none">
      <rect x="2" y="2" width="60" height="38" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
      <rect x="26" y="40" width="12" height="6" fill="var(--color-border)" />
      <rect x="18" y="46" width="28" height="2" rx="1" fill="var(--color-border)" />

      {step === 1 && (
        <>
          <circle cx="18" cy="16" r="6" fill="var(--color-primary)" opacity="0.25" />
          <circle cx="18" cy="16" r="3.2" fill="var(--color-primary)" />
          <rect x="30" y="12" width="24" height="4" rx="2" fill="var(--color-border)" />
          <rect x="30" y="20" width="18" height="4" rx="2" fill="var(--color-border)" />
        </>
      )}
      {step === 2 && (
        <>
          <rect x="10" y="10" width="44" height="6" rx="3" fill="var(--color-border)" />
          <rect x="10" y="20" width="44" height="6" rx="3" fill="var(--color-border)" />
          <circle cx="49" cy="13" r="7" fill="#22c55e" />
          <path d="M46 13l2 2 4-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {step === 3 && (
        <>
          <rect x="12" y="20" width="6" height="10" fill="var(--color-primary)" opacity="0.5" />
          <rect x="22" y="14" width="6" height="16" fill="var(--color-secondary)" opacity="0.6" />
          <rect x="32" y="8" width="6" height="22" fill="var(--color-primary)" />
          <circle cx="49" cy="16" r="8" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="18 8" />
        </>
      )}
    </svg>
  );
}

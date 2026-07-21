import type { ReactElement } from "react";

const paths: Record<string, ReactElement> = {
  examLike: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  results: (
    <>
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 19v-5m5 5v-9m5 9V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  courses: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H19" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  anytime: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function FeatureIcon({ kind, tone }: { kind: keyof typeof paths; tone: string }) {
  return (
    <div className={`feature-icon feature-icon--${tone}`}>
      <svg viewBox="0 0 24 24" fill="none">
        {paths[kind]}
      </svg>
    </div>
  );
}

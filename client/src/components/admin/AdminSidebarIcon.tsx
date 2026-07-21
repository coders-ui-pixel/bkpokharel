import type { ReactElement } from "react";

const paths: Record<string, ReactElement> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="12" y="3" width="9" height="5" rx="1.5" />
      <rect x="12" y="10" width="9" height="11" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  courses: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  enrollments: (
    <>
      <path d="M9 12.5l2 2 4-4.5" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </>
  ),
  homepage: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  questionBank: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </>
  ),
  students: (
    <>
      <circle cx="9" cy="7" r="3.2" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <path d="M16 4.2c1.5.4 2.5 1.7 2.5 3.3s-1 2.9-2.5 3.3" />
      <path d="M19 14.3c1.8.6 3 2.3 3 4.2" />
    </>
  ),
  questionSets: (
    <>
      <rect x="3" y="4" width="8" height="8" rx="1.5" />
      <rect x="13" y="4" width="8" height="8" rx="1.5" />
      <rect x="3" y="14" width="8" height="6" rx="1.5" />
      <rect x="13" y="14" width="8" height="6" rx="1.5" />
    </>
  ),
  liveExams: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  rankings: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4a3 3 0 0 0 3 4" />
      <path d="M17 6h3a3 3 0 0 1-3 4" />
    </>
  ),
  notes: (
    <>
      <path d="M6 2h9l3 3v17H6Z" />
      <path d="M9 11h6M9 15h6M9 7h3" />
    </>
  ),
  importantQuestions: (
    <>
      <path d="m12 2 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 15.9l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6Z" />
    </>
  ),
  flashcards: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" transform="rotate(-6 10 10)" />
      <rect x="6" y="8" width="14" height="10" rx="2" />
    </>
  ),
  notifications: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  announcements: (
    <>
      <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4v-9" />
      <path d="M9 6l7-3v18l-7-3H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3Z" />
      <path d="M19 9a3 3 0 0 1 0 6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 19h16" />
      <path d="M7 19v-6m5 6v-10m5 10V6" />
    </>
  ),
  roles: (
    <>
      <path d="M12 3 4 6.5v5c0 5 3.4 8.5 8 9.5 4.6-1 8-4.5 8-9.5v-5Z" />
      <path d="m9 12 2 2 4-4.5" />
    </>
  ),
  security: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="15.5" r="1.4" />
    </>
  ),
  subjects: (
    <>
      <path d="M4 4.5A2 2 0 0 1 6 3h6v18H6a2 2 0 0 1-2-2Z" />
      <path d="M12 3h6a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-6" />
      <path d="M6 8h4M6 12h4" />
    </>
  ),
  branding: (
    <>
      <path d="M12 2 2 7l10 5 10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>
  ),
  coupons: (
    <>
      <path d="M3 10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z" />
      <path d="M9.5 8v8" strokeDasharray="2 2" />
    </>
  ),
  syllabus: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="8" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <path d="M11 8.5h7" />
      <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M11 13h7" />
      <circle cx="8" cy="17.5" r="1" fill="currentColor" stroke="none" />
      <path d="M11 17.5h5" />
    </>
  ),
};

export function AdminSidebarIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

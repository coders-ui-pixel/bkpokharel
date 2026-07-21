import { Link } from "react-router-dom";
import { useSiteSettings } from "../../features/siteSettings/hooks";

const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.6c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.8 1.38-3.8 3.9V10H8.2v3.1h2.7v8h2.6Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 3c.4 2.2 1.9 3.8 4 4.1v2.9c-1.5 0-2.9-.5-4-1.3v6.4c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .6 0 1 .1v3c-.3-.1-.6-.2-1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V3h3Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export function Footer() {
  const { data: settings } = useSiteSettings();

  const socialLinks = [
    { key: "facebook", url: settings?.facebookUrl },
    { key: "instagram", url: settings?.instagramUrl },
    { key: "tiktok", url: settings?.tiktokUrl },
    { key: "youtube", url: settings?.youtubeUrl },
  ].filter((s): s is { key: keyof typeof SOCIAL_ICONS; url: string } => !!s.url);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand">{settings?.siteName ?? "MCQ Platform"}</span>
          <p>Free chapter-wise notes, MCQ practice, and live exams.</p>
        </div>

        <nav className="site-footer__links">
          <Link to="/courses">Courses</Link>
          <Link to="/syllabus">Syllabus</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>

        {socialLinks.length > 0 && (
          <div className="site-footer__social">
            {socialLinks.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.key}>
                {SOCIAL_ICONS[s.key]}
              </a>
            ))}
          </div>
        )}
      </div>
      <p className="site-footer__copyright">
        © {new Date().getFullYear()} {settings?.siteName ?? "MCQ Platform"}. All rights reserved.
      </p>
    </footer>
  );
}

import type { ReactNode } from "react";

interface AdminPageHeroProps {
  icon: string;
  title: string;
  subtitle: string;
  stats?: { label: string; value: string | number }[];
  action?: ReactNode;
}

export function AdminPageHero({ icon, title, subtitle, stats, action }: AdminPageHeroProps) {
  return (
    <div className="admin-hero">
      <div className="admin-hero__icon">{icon}</div>
      <div className="admin-hero__body">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {stats && stats.length > 0 && (
        <div className="admin-hero__stats">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      {action && <div className="admin-hero__action">{action}</div>}
    </div>
  );
}

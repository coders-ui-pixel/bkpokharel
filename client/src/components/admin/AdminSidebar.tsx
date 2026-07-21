import { NavLink } from "react-router-dom";
import { usePendingEnrollmentCount } from "../../features/courses/hooks";
import { AdminSidebarIcon } from "./AdminSidebarIcon";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
      { to: "/admin/analytics", label: "Analytics", icon: "analytics" },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/courses", label: "Courses", icon: "courses" },
      { to: "/admin/subjects", label: "Subjects", icon: "subjects" },
      { to: "/admin/syllabus", label: "Syllabus", icon: "syllabus" },
      { to: "/admin/coupons", label: "Coupons", icon: "coupons" },
      { to: "/admin/question-bank", label: "Question Bank", icon: "questionBank" },
      { to: "/admin/question-sets", label: "Question Sets", icon: "questionSets" },
      { to: "/admin/notes", label: "Study Notes", icon: "notes" },
      { to: "/admin/important-questions", label: "Important Questions", icon: "importantQuestions" },
      { to: "/admin/flashcards", label: "Flash Cards", icon: "flashcards" },
    ],
  },
  {
    label: "Students & Exams",
    items: [
      { to: "/admin/students", label: "Students", icon: "students" },
      { to: "/admin/enrollments", label: "Enrollment Requests", icon: "enrollments", badge: true },
      { to: "/admin/live-exams", label: "Live Exams", icon: "liveExams" },
      { to: "/admin/live-exams/rankings", label: "Rankings & Certificates", icon: "rankings" },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: "notifications" },
      { to: "/admin/announcements", label: "Announcements", icon: "announcements" },
      { to: "/admin/calendar", label: "Calendar", icon: "calendar" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/roles", label: "Roles & Permissions", icon: "roles" },
      { to: "/admin/security", label: "Settings & Security", icon: "security" },
      { to: "/admin/homepage", label: "Homepage Hero Images", icon: "homepage" },
      { to: "/admin/branding", label: "Branding & Theme", icon: "branding" },
    ],
  },
] as const;

export function AdminSidebar() {
  const { data: pendingCount } = usePendingEnrollmentCount();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">Admin Panel</div>
      <nav className="admin-sidebar__nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="admin-sidebar__group">
            <span className="admin-sidebar__group-label">{group.label}</span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) => `admin-sidebar__link ${isActive ? "is-active" : ""}`}
              >
                <AdminSidebarIcon name={item.icon} />
                <span>{item.label}</span>
                {"badge" in item && !!pendingCount && (
                  <span className="admin-nav-badge">{pendingCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <a href="/" className="admin-sidebar__site-link">
        <AdminSidebarIcon name="external" />
        <span>View site</span>
      </a>
    </aside>
  );
}

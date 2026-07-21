import { NavLink } from "react-router-dom";
import { SidebarIcon } from "./SidebarIcon";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/dashboard/courses", label: "My Courses", icon: "courses" },
  { to: "/dashboard/practice", label: "MCQ Practice", icon: "practice" },
  { to: "/dashboard/mock-tests", label: "Mock Tests", icon: "mockTests" },
  { to: "/dashboard/notes", label: "Study Notes", icon: "notes" },
  { to: "/dashboard/important-questions", label: "Important Questions", icon: "notes" },
  { to: "/dashboard/flashcards", label: "Flash Cards", icon: "flashcards" },
  { to: "/dashboard/planner", label: "Study Planner", icon: "planner" },
  { to: "/dashboard/bookmarks", label: "Bookmarks", icon: "bookmarks" },
  { to: "/dashboard/progress", label: "Progress", icon: "progress" },
  { to: "/dashboard/notifications", label: "Notifications", icon: "notifications" },
  { to: "/dashboard/profile", label: "Profile", icon: "profile" },
  { to: "/dashboard/settings", label: "Settings", icon: "settings" },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__brand">MCQ Platform</div>
      <nav className="dash-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : false}
            className={({ isActive }) => `dash-sidebar__link ${isActive ? "is-active" : ""}`}
          >
            <SidebarIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Command {
  id: string;
  label: string;
  group: string;
  action: () => void;
}

export function CommandPalette() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);

    function onOpenRequest() {
      setOpen(true);
    }
    window.addEventListener("cmdk:open", onOpenRequest);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("cmdk:open", onOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  const commands = useMemo<Command[]>(() => {
    const items: Command[] = [];

    if (!user) {
      items.push(
        { id: "home", label: "Home", group: "Site", action: () => go("/") },
        { id: "courses-public", label: "Browse Courses", group: "Site", action: () => go("/courses") },
        { id: "syllabus", label: "Syllabus", group: "Site", action: () => go("/syllabus") },
        { id: "about", label: "About", group: "Site", action: () => go("/about") },
        { id: "contact", label: "Contact", group: "Site", action: () => go("/contact") },
        { id: "login", label: "Log in", group: "Account", action: () => go("/login") },
        { id: "register", label: "Create an account", group: "Account", action: () => go("/register") }
      );
      return items;
    }

    items.push(
      { id: "dash-home", label: "Dashboard", group: "Dashboard", action: () => go("/dashboard") },
      { id: "dash-courses", label: "My Courses", group: "Dashboard", action: () => go("/dashboard/courses") },
      { id: "dash-practice", label: "MCQ Practice", group: "Dashboard", action: () => go("/dashboard/practice") },
      { id: "dash-mock", label: "Mock Tests", group: "Dashboard", action: () => go("/dashboard/mock-tests") },
      { id: "dash-notes", label: "Study Notes", group: "Dashboard", action: () => go("/dashboard/notes") },
      {
        id: "dash-iq",
        label: "Important Questions",
        group: "Dashboard",
        action: () => go("/dashboard/important-questions"),
      },
      { id: "dash-flash", label: "Flash Cards", group: "Dashboard", action: () => go("/dashboard/flashcards") },
      { id: "dash-planner", label: "Study Planner", group: "Dashboard", action: () => go("/dashboard/planner") },
      { id: "dash-bookmarks", label: "Bookmarks", group: "Dashboard", action: () => go("/dashboard/bookmarks") },
      { id: "dash-progress", label: "Progress", group: "Dashboard", action: () => go("/dashboard/progress") },
      {
        id: "dash-notifications",
        label: "Notifications",
        group: "Dashboard",
        action: () => go("/dashboard/notifications"),
      },
      { id: "dash-profile", label: "Profile", group: "Dashboard", action: () => go("/dashboard/profile") },
      { id: "dash-settings", label: "Settings", group: "Dashboard", action: () => go("/dashboard/settings") }
    );

    if (user.role === "admin") {
      items.push(
        { id: "admin-home", label: "Admin Dashboard", group: "Admin", action: () => go("/admin") },
        { id: "admin-students", label: "Admin: Students", group: "Admin", action: () => go("/admin/students") },
        { id: "admin-courses", label: "Admin: Courses", group: "Admin", action: () => go("/admin/courses") },
        { id: "admin-subjects", label: "Admin: Subjects", group: "Admin", action: () => go("/admin/subjects") },
        { id: "admin-syllabus", label: "Admin: Syllabus", group: "Admin", action: () => go("/admin/syllabus") },
        { id: "admin-coupons", label: "Admin: Coupons", group: "Admin", action: () => go("/admin/coupons") },
        {
          id: "admin-enrollments",
          label: "Admin: Enrollment Requests",
          group: "Admin",
          action: () => go("/admin/enrollments"),
        },
        {
          id: "admin-qbank",
          label: "Admin: Question Bank",
          group: "Admin",
          action: () => go("/admin/question-bank"),
        },
        {
          id: "admin-qsets",
          label: "Admin: Question Sets",
          group: "Admin",
          action: () => go("/admin/question-sets"),
        },
        {
          id: "admin-live",
          label: "Admin: Live Exams",
          group: "Admin",
          action: () => go("/admin/live-exams"),
        },
        {
          id: "admin-live-rankings",
          label: "Admin: Rankings & Certificates",
          group: "Admin",
          action: () => go("/admin/live-exams/rankings"),
        },
        { id: "admin-notes", label: "Admin: Study Notes", group: "Admin", action: () => go("/admin/notes") },
        {
          id: "admin-iq",
          label: "Admin: Important Questions",
          group: "Admin",
          action: () => go("/admin/important-questions"),
        },
        {
          id: "admin-flash",
          label: "Admin: Flash Cards",
          group: "Admin",
          action: () => go("/admin/flashcards"),
        },
        {
          id: "admin-notifications",
          label: "Admin: Notifications",
          group: "Admin",
          action: () => go("/admin/notifications"),
        },
        {
          id: "admin-announcements",
          label: "Admin: Announcements",
          group: "Admin",
          action: () => go("/admin/announcements"),
        },
        {
          id: "admin-calendar",
          label: "Admin: Calendar",
          group: "Admin",
          action: () => go("/admin/calendar"),
        },
        {
          id: "admin-analytics",
          label: "Admin: Analytics",
          group: "Admin",
          action: () => go("/admin/analytics"),
        },
        {
          id: "admin-roles",
          label: "Admin: Roles & Permissions",
          group: "Admin",
          action: () => go("/admin/roles"),
        },
        {
          id: "admin-security",
          label: "Admin: Settings & Security",
          group: "Admin",
          action: () => go("/admin/security"),
        },
        {
          id: "admin-homepage",
          label: "Admin: Homepage Hero Images",
          group: "Admin",
          action: () => go("/admin/homepage"),
        },
        {
          id: "admin-branding",
          label: "Admin: Branding & Theme",
          group: "Admin",
          action: () => go("/admin/branding"),
        }
      );
    }

    items.push({
      id: "logout",
      label: "Log out",
      group: "Account",
      action: () => {
        logout();
        setOpen(false);
      },
    });

    return items;
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands
      .filter((c) => c.label.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      });
  }, [commands, query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selected]?.action();
    }
  }

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="cmdk-list">
          {filtered.length === 0 && <p className="cmdk-empty">No matches.</p>}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`cmdk-item ${i === selected ? "is-selected" : ""}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => c.action()}
            >
              <span className="cmdk-item__group">{c.group}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <div className="cmdk-footer">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

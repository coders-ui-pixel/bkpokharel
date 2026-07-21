import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { SidebarIcon } from "./SidebarIcon";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="dash-topbar">
      <div className="dash-topbar__greeting">
        <strong>
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </strong>
        <span>{getTodayLabel()}</span>
      </div>

      <div
        className="dash-topbar__search"
        role="button"
        tabIndex={0}
        onClick={() => window.dispatchEvent(new CustomEvent("cmdk:open"))}
        onKeyDown={(e) => {
          if (e.key === "Enter") window.dispatchEvent(new CustomEvent("cmdk:open"));
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search or jump to..."
          readOnly
          onFocus={(e) => {
            e.target.blur();
            window.dispatchEvent(new CustomEvent("cmdk:open"));
          }}
        />
        <kbd className="dash-topbar__search-kbd">Ctrl K</kbd>
      </div>

      <div className="dash-topbar__actions">
        <NotificationBell />
        <ThemeToggle />
        <div className="dash-topbar__avatar" title={user?.name}>
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <button type="button" className="dash-topbar__logout" onClick={() => void handleLogout()}>
          <SidebarIcon name="logout" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}

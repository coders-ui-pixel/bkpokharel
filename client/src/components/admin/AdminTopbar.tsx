import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { AdminSidebarIcon } from "./AdminSidebarIcon";

export function AdminTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__title">Admin Panel</div>
      <div className="admin-topbar__actions">
        <ThemeToggle />
        <span className="admin-topbar__user">{user?.name}</span>
        <button type="button" className="admin-topbar__logout" onClick={() => void logout()}>
          <AdminSidebarIcon name="logout" />
          Log out
        </button>
      </div>
    </header>
  );
}

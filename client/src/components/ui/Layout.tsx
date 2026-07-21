import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePendingEnrollmentCount } from "../../features/courses/hooks";
import { useSiteSettings } from "../../features/siteSettings/hooks";
import { assetUrl } from "../../lib/assetUrl";
import { ThemeToggle } from "./ThemeToggle";
import { Footer } from "./Footer";

export function Layout() {
  const { user, logout } = useAuth();
  const { data: pendingCount } = usePendingEnrollmentCount(user?.role === "admin");
  const { data: settings } = useSiteSettings();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          {settings?.logoImagePath && (
            <img src={assetUrl(settings.logoImagePath)} alt="" className="brand__logo" />
          )}
          {settings?.siteName ?? "MCQ Platform"}
        </Link>

        <nav className="nav-links">
          <Link to="/courses">Courses</Link>
          <Link to="/syllabus">Syllabus</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user?.role === "admin" && (
            <Link to="/admin">
              Admin
              {!!pendingCount && <span className="admin-nav-badge">{pendingCount}</span>}
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <button type="button" className="nav-btn nav-btn--ghost" onClick={() => void logout()}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn--ghost">
                Log in
              </Link>
              <Link to="/register" className="nav-btn nav-btn--solid">
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

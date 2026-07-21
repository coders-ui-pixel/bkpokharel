import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAdminStatsOverview } from "../../features/adminStats/hooks";

const QUICK_LINKS = [
  { to: "/admin/courses", label: "Manage courses & chapters", icon: "📘" },
  { to: "/admin/enrollments", label: "Enrollment requests", icon: "✅" },
  { to: "/admin/question-bank", label: "Question bank", icon: "🗂" },
  { to: "/admin/question-sets", label: "Question sets", icon: "🧩" },
  { to: "/admin/live-exams", label: "Live exams", icon: "⏱" },
  { to: "/admin/analytics", label: "Analytics", icon: "📊" },
];

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStatsOverview();

  const cards = stats
    ? [
        { label: "Approved students", value: stats.approvedEnrollments, icon: "🎓", accent: "primary" },
        { label: "Registered students", value: stats.totalStudents, icon: "👥", accent: "blue" },
        { label: "Courses created", value: stats.totalCourses, icon: "📘", accent: "violet" },
        { label: "Published courses", value: stats.publishedCourses, icon: "✅", accent: "green" },
        { label: "Pending requests", value: stats.pendingEnrollments, icon: "⏳", accent: "amber" },
        { label: "Contact messages", value: stats.contactMessages, icon: "✉️", accent: "cyan" },
        { label: "Questions in bank", value: stats.totalQuestions, icon: "🗂", accent: "rose" },
        { label: "Question sets", value: stats.totalQuestionSets, icon: "🧩", accent: "indigo" },
      ]
    : [];

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--admin">
        <div className="practice-hero__icon">🛠</div>
        <div className="practice-hero__body">
          <h1>Admin dashboard</h1>
          <p>Live overview of students, content, and activity across the platform.</p>
        </div>
        {stats && (
          <div className="practice-hero__stats">
            <div>
              <strong>{stats.approvedEnrollments}</strong>
              <span>Active students</span>
            </div>
            <div>
              <strong>{stats.pendingEnrollments}</strong>
              <span>Pending</span>
            </div>
            <div>
              <strong>{stats.totalCourses}</strong>
              <span>Courses</span>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p>Loading stats...</p>}

      <div className="admin-stats-grid admin-stats-grid--rich">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            className={`admin-stat-card admin-stat-card--${c.accent}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.32) }}
          >
            <span className="admin-stat-card__icon">{c.icon}</span>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="admin-section">
        <div className="admin-section__heading">Quick links</div>
        <div className="admin-quicklink-grid">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="admin-quicklink-card">
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel-card">
          <h2>Recent enrollment activity</h2>
          {stats?.recentEnrollments.length === 0 && <p className="course-meta">No enrollment requests yet.</p>}
          <ul className="admin-activity-list">
            {stats?.recentEnrollments.map((e) => (
              <li key={e.id}>
                <strong>{e.user.name}</strong> requested <strong>{e.course.title}</strong>
                <span className={`badge ${e.status === "pending" ? "badge--pending" : ""}`}>
                  {e.status}
                </span>
                <span className="course-meta">{new Date(e.requestedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-panel-card">
          <h2>Messages from the website</h2>
          {stats?.recentContactMessages.length === 0 && <p className="course-meta">No messages yet.</p>}
          <ul className="admin-activity-list">
            {stats?.recentContactMessages.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong> ({m.email})
                <p>{m.message}</p>
                <span className="course-meta">{new Date(m.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

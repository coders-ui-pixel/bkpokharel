import { useAnalyticsOverview, useDeviceBreakdown, useWeakChapters } from "../../../features/analytics/hooks";

const DEVICE_LABEL: Record<string, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  tablet: "Tablet",
  unknown: "Unknown",
};

export function AdminAnalyticsPage() {
  const { data: overview, isLoading } = useAnalyticsOverview();
  const { data: weakChapters } = useWeakChapters();
  const { data: devices } = useDeviceBreakdown();

  const totalDeviceSessions = devices?.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <section>
      <h1>Analytics</h1>

      {isLoading && <p>Loading...</p>}

      {overview && (
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <strong>{overview.totalStudents}</strong>
            <span>Total students</span>
          </div>
          <div className="dash-stat-card">
            <strong>{overview.activeStudents7d}</strong>
            <span>Active in last 7 days</span>
          </div>
          <div className="dash-stat-card">
            <strong>{overview.retentionRate30d.toFixed(1)}%</strong>
            <span>30-day retention</span>
          </div>
          <div className="dash-stat-card">
            <strong>{overview.totalAttempts}</strong>
            <span>Total attempts (practice + mock)</span>
          </div>
          <div className="dash-stat-card">
            <strong>{overview.avgScorePercent.toFixed(1)}%</strong>
            <span>Avg. score across attempts</span>
          </div>
          <div className="dash-stat-card">
            <strong>Rs. {overview.estimatedRevenue.toLocaleString()}</strong>
            <span>Estimated revenue ({overview.paidEnrollmentCount} paid enrollments)</span>
          </div>
        </div>
      )}
      <p className="course-meta" style={{ marginTop: 8 }}>
        Revenue is estimated from approved paid enrollments × course price — connect a payment
        processor for exact transaction-level revenue.
      </p>

      <h2>Weakest chapters (site-wide)</h2>
      <p className="course-meta">Chapters where students are answering incorrectly most often (min. 3 answers).</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Chapter</th>
            <th>Subject</th>
            <th>Accuracy</th>
            <th>Answers</th>
          </tr>
        </thead>
        <tbody>
          {weakChapters?.map((c) => (
            <tr key={c.chapterId}>
              <td>{c.chapterTitle}</td>
              <td>{c.subjectTitle}</td>
              <td>{c.accuracyPercent.toFixed(1)}%</td>
              <td>{c.totalAnswers}</td>
            </tr>
          ))}
          {weakChapters?.length === 0 && (
            <tr>
              <td colSpan={4}>Not enough attempt data yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Device breakdown</h2>
      <p className="course-meta">Based on login sessions since device tracking was enabled.</p>
      <div className="dash-stats-grid dash-stats-grid--compact">
        {devices?.map((d) => (
          <div className="dash-stat-card" key={d.deviceType}>
            <strong>{totalDeviceSessions ? Math.round((d.count / totalDeviceSessions) * 100) : 0}%</strong>
            <span>
              {DEVICE_LABEL[d.deviceType] ?? d.deviceType} ({d.count})
            </span>
          </div>
        ))}
        {devices?.length === 0 && <p className="course-meta">No session data yet.</p>}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useMyEnrollments } from "../../features/courses/hooks";

export function DashboardCoursesPage() {
  const { data: enrollments, isLoading } = useMyEnrollments();

  if (isLoading) return <p>Loading...</p>;

  return (
    <section>
      <h1>My Courses</h1>
      {enrollments?.length === 0 && (
        <p>
          You haven't enrolled in any courses yet — <Link to="/courses">browse the catalog</Link>.
        </p>
      )}
      <div className="course-grid">
        {enrollments?.map(({ course }) => (
          <div key={course.id} className="course-card dash-course-card">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <div className="dash-course-card__progress">
              <div className="dash-course-card__progress-bar">
                <div style={{ width: "0%" }} />
              </div>
              <span>0% complete</span>
            </div>
            <div className="dash-course-card__actions">
              <Link to={`/courses/${course.id}`} className="btn-link">
                Continue Learning
              </Link>
              <Link to={`/courses/${course.id}`} className="btn-link">
                Open Notes
              </Link>
              <Link to={`/courses/${course.id}`} className="btn-link">
                Practice MCQ
              </Link>
              <Link to={`/courses/${course.id}`} className="btn-link">
                Mock Test
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

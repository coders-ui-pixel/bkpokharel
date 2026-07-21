import { Link } from "react-router-dom";
import { useCourses } from "../../features/courses/hooks";
import { assetUrl } from "../../lib/assetUrl";

export function CourseCatalogPage() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) return <p>Loading courses...</p>;
  if (error) return <p className="form-error">Could not load courses.</p>;

  return (
    <section>
      <h1>Courses</h1>
      {courses?.length === 0 && <p>No courses published yet — check back soon.</p>}
      <div className="cart-grid">
        {courses?.map((course) => (
          <div key={course.id} className="cart-card">
            <Link to={`/courses/${course.id}`} className="cart-card__thumb">
              {course.coverImageUrl ? (
                <img src={assetUrl(course.coverImageUrl)} alt={course.title} />
              ) : (
                <div className="cart-card__thumb-placeholder">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 2h9l3 3v17H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9 11h6M9 15h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <span className={`cart-card__price-tag ${course.isPaid ? "is-paid" : "is-free"}`}>
                {course.isPaid ? `Rs. ${course.price}` : "Free"}
              </span>
            </Link>
            <div className="cart-card__body">
              <Link to={`/courses/${course.id}`}>
                <h2>{course.title}</h2>
              </Link>
              <p>{course.description}</p>
              <p className="course-meta">
                {course._count?.subjects ?? 0} subjects · {course._count?.enrollments ?? 0} enrolled
              </p>
              <Link to={`/courses/${course.id}`} className="btn btn--primary btn--block">
                {course.isPaid ? "View & enroll" : "Enroll for free"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

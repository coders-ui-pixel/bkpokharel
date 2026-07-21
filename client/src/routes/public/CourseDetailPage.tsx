import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse, useMyEnrollmentForCourse } from "../../features/courses/hooks";
import { assetUrl } from "../../lib/assetUrl";

export function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: enrollment } = useMyEnrollmentForCourse(courseId);

  if (isLoading) return <p>Loading...</p>;
  if (!course) return <p>Course not found.</p>;

  const isApproved = enrollment?.status === "approved";
  const totalChapters =
    course.subjects?.reduce((sum, s) => sum + (s.chapters?.length ?? 0), 0) ?? 0;

  return (
    <section className="course-detail-page">
      <div className="course-detail-hero">
        <div className="course-detail-hero__cover">
          {course.coverImageUrl ? (
            <img src={assetUrl(course.coverImageUrl)} alt={course.title} />
          ) : (
            <div className="course-detail-hero__cover-placeholder">{course.title.charAt(0)}</div>
          )}
        </div>

        <div className="course-detail-hero__body">
          <span className={`course-detail-hero__price-tag ${course.isPaid ? "is-paid" : "is-free"}`}>
            {course.isPaid ? `Rs. ${course.price}` : "Free"}
          </span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <p className="course-meta">
            {course.subjects?.length ?? 0} subjects · {totalChapters} chapters
          </p>

          <div className="course-detail-hero__cta">
            {user && !enrollment && (
              <Link to={`/courses/${courseId}/checkout`} className="btn btn--primary btn--lg">
                {course.isPaid ? "Enroll & pay →" : "Request enrollment →"}
              </Link>
            )}
            {enrollment?.status === "pending" && (
              <span className="badge badge--pending">Enrollment request pending admin verification</span>
            )}
            {enrollment?.status === "rejected" && (
              <>
                <span className="form-error">Your enrollment request was not approved.</span>
                <Link to={`/courses/${courseId}/checkout`} className="btn btn--primary btn--lg">
                  Request again →
                </Link>
              </>
            )}
            {isApproved && <span className="badge">✓ You're enrolled</span>}
            {!user && (
              <Link to="/login" className="btn btn--primary btn--lg">
                Log in to enroll →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="course-detail-outline">
        <h2>Subjects &amp; chapters</h2>
        {course.subjects?.map((subject) => (
          <details key={subject.id} className="course-outline-item" open>
            <summary>
              {subject.title}
              <span className="course-meta">{subject.chapters?.length ?? 0} ch.</span>
            </summary>
            <ul className="course-outline-chapters">
              {subject.chapters?.map((chapter) => (
                <li key={chapter.id} className={isApproved ? "" : "is-locked"}>
                  <span>{chapter.title}</span>
                  {isApproved ? (
                    <span className="course-outline-chapters__links">
                      <Link to={`/learn/${subject.id}/chapters/${chapter.id}/notes`}>Notes</Link>
                      <Link to={`/learn/${subject.id}/chapters/${chapter.id}/practice`}>
                        Practice MCQs
                      </Link>
                    </span>
                  ) : (
                    <span className="course-meta">🔒 enroll to unlock</span>
                  )}
                </li>
              ))}
              {subject.chapters?.length === 0 && (
                <li className="course-meta">No chapters added yet.</li>
              )}
            </ul>
          </details>
        ))}
        {course.subjects?.length === 0 && <p className="course-meta">No subjects added yet.</p>}
      </div>
    </section>
  );
}

import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCourses, useCreateCourse } from "../../../features/courses/hooks";
import { assetUrl } from "../../../lib/assetUrl";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";

export function AdminCoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await createCourse.mutateAsync({
      title,
      description,
      isPaid,
      price: isPaid ? Number(price) : null,
      isFeatured,
    });
    setTitle("");
    setDescription("");
    setIsPaid(false);
    setPrice("");
    setIsFeatured(false);
    setFormOpen(false);
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="📘"
        title="Courses"
        subtitle="Create and manage the courses students can enroll in."
        stats={[{ label: "Total courses", value: courses?.length ?? 0 }]}
        action={
          <button type="button" className="btn" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? "Cancel" : "+ Create course"}
          </button>
        }
      />

      {formOpen && (
        <div className="admin-panel">
          <form onSubmit={handleCreate} className="admin-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label className="admin-form__checkbox">
              <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
              This is a paid course
            </label>
            {isPaid && (
              <label>
                Price (Rs.)
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>
            )}
            <label className="admin-form__checkbox">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Show this course on the homepage
            </label>
            <button type="submit" className="btn btn--primary" disabled={createCourse.isPending}>
              {createCourse.isPending ? "Creating..." : "Create course"}
            </button>
          </form>
        </div>
      )}

      {isLoading && <p>Loading...</p>}

      <div className="cart-grid">
        {courses?.map((course) => (
          <Link key={course.id} to={`/admin/courses/${course.id}`} className="cart-card">
            <div className="cart-card__thumb">
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
              {!course.isPublished && <span className="cart-card__draft-tag">Unpublished</span>}
              {course.isFeatured && <span className="cart-card__featured-tag">★ Featured</span>}
            </div>
            <div className="cart-card__body">
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <p className="course-meta">
                {course._count?.subjects ?? 0} subjects · {course._count?.enrollments ?? 0} enrolled
              </p>
              <span className="btn btn--ghost btn--block">Manage course →</span>
            </div>
          </Link>
        ))}
        {courses?.length === 0 && <p>No courses yet — create one above.</p>}
      </div>
    </section>
  );
}

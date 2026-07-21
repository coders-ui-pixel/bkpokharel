import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import {
  useCourse,
  useDeleteCourse,
  useUpdateCourse,
  useUploadCourseCoverImage,
  useUploadCoursePaymentQr,
} from "../../../features/courses/hooks";
import {
  useAllSubjects,
  useAssignSubjectToCourse,
  useCreateSubject,
  useSubjects,
} from "../../../features/subjects/hooks";
import { assetUrl } from "../../../lib/assetUrl";

export function AdminCourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const { data: course, isLoading } = useCourse(courseId);
  const { data: subjects } = useSubjects(courseId);
  const { data: allSubjects } = useAllSubjects();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadCover = useUploadCourseCoverImage();
  const uploadQr = useUploadCoursePaymentQr();
  const createSubject = useCreateSubject(courseId);
  const assignSubject = useAssignSubjectToCourse();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [selectedToAssign, setSelectedToAssign] = useState<number[]>([]);

  const assignableSubjects = useMemo(
    () => allSubjects?.filter((s) => s.courseId !== courseId) ?? [],
    [allSubjects, courseId]
  );

  if (course && !initialized) {
    setTitle(course.title);
    setDescription(course.description);
    setIsPaid(course.isPaid);
    setPrice(course.price ?? "");
    setIsFeatured(course.isFeatured);
    setInitialized(true);
  }

  if (isLoading) return <p>Loading...</p>;
  if (!course) return <p>Course not found.</p>;

  async function handleSaveDetails(event: FormEvent) {
    event.preventDefault();
    await updateCourse.mutateAsync({
      id: courseId,
      input: { title, description, isPaid, price: isPaid ? Number(price) : null, isFeatured },
    });
  }

  async function handleAddSubject(event: FormEvent) {
    event.preventDefault();
    await createSubject.mutateAsync({ title: newSubjectTitle });
    setNewSubjectTitle("");
  }

  function toggleAssignSelect(id: number) {
    setSelectedToAssign((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleAssignSelected() {
    await Promise.all(
      selectedToAssign.map((subjectId) => assignSubject.mutateAsync({ subjectId, courseId }))
    );
    setSelectedToAssign([]);
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="📘"
        title={course.title}
        subtitle={course.description}
        stats={[
          { label: "Subjects", value: subjects?.length ?? 0 },
          { label: "Status", value: course.isPublished ? "Published" : "Draft" },
          { label: "Price", value: course.isPaid ? `Rs. ${course.price}` : "Free" },
        ]}
        action={
          <Link to="/admin/courses" className="btn btn--ghost">
            ← Back to courses
          </Link>
        }
      />

      <div className="admin-course-detail-grid">
        <div className="checkout-card">
          <h2>Course details</h2>
          <form onSubmit={handleSaveDetails} className="admin-form">
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
            <button type="submit" className="btn btn--primary" disabled={updateCourse.isPending}>
              {updateCourse.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>

          <div className="admin-table__actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                updateCourse.mutate({ id: courseId, input: { isPublished: !course.isPublished } })
              }
            >
              {course.isPublished ? "Unpublish" : "Publish"}
            </button>
            <Link to={`/admin/enrollments?courseId=${courseId}`} className="btn btn--ghost">
              View enrollment requests
            </Link>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                if (confirm(`Delete "${course.title}"? This cannot be undone.`)) {
                  deleteCourse.mutate(courseId);
                }
              }}
            >
              Delete course
            </button>
          </div>
        </div>

        <div className="checkout-card">
          <h2>Cover image</h2>
          {course.coverImageUrl ? (
            <img src={assetUrl(course.coverImageUrl)} alt={course.title} className="admin-cover-preview" />
          ) : (
            <p className="course-meta">No cover image uploaded yet.</p>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCover.mutate({ id: courseId, file });
              e.target.value = "";
            }}
          />
          <button type="button" className="btn btn--ghost" onClick={() => coverInputRef.current?.click()}>
            {course.coverImageUrl ? "Replace cover image" : "Upload cover image"}
          </button>

          {course.isPaid && (
            <>
              <h2 style={{ marginTop: 20 }}>Payment QR code</h2>
              {course.paymentQrImagePath ? (
                <img
                  src={assetUrl(course.paymentQrImagePath)}
                  alt="Payment QR"
                  className="admin-qr-preview"
                />
              ) : (
                <p className="course-meta">No QR code uploaded yet — students can't pay until you add one.</p>
              )}
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadQr.mutate({ id: courseId, file });
                  e.target.value = "";
                }}
              />
              <button type="button" className="btn btn--ghost" onClick={() => qrInputRef.current?.click()}>
                {course.paymentQrImagePath ? "Replace QR code" : "Upload QR code"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 24 }}>
        <h2 className="admin-section__heading">Subjects in this course</h2>
        <form onSubmit={handleAddSubject} className="admin-form admin-form--inline">
          <input
            value={newSubjectTitle}
            onChange={(e) => setNewSubjectTitle(e.target.value)}
            placeholder="New subject title (e.g. Physics)"
            required
          />
          <button type="submit" className="btn btn--primary" disabled={createSubject.isPending}>
            {createSubject.isPending ? "Adding..." : "+ Add new subject"}
          </button>
        </form>

        <div className="subject-grid" style={{ marginTop: 16 }}>
          {subjects?.map((subject) => (
            <div key={subject.id} className="subject-card-wrap">
              <Link to={`/admin/subjects/${subject.id}`} className="subject-card">
                <h3>{subject.title}</h3>
                <p className="course-meta">{subject._count?.chapters ?? 0} chapters</p>
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={assignSubject.isPending}
                onClick={() => assignSubject.mutate({ subjectId: subject.id, courseId: null })}
              >
                Remove from course
              </button>
            </div>
          ))}
          {subjects?.length === 0 && <p>No subjects yet — add one above or assign one below.</p>}
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 24 }}>
        <h2 className="admin-section__heading">Assign existing subjects to this course</h2>
        <p className="course-meta">
          Pick subjects already in your library (or move them from another course) into "{course.title}".
        </p>
        <div className="coupon-course-picker" style={{ maxHeight: 260 }}>
          {assignableSubjects.map((s) => (
            <label key={s.id} className="coupon-course-picker__item">
              <input
                type="checkbox"
                checked={selectedToAssign.includes(s.id)}
                onChange={() => toggleAssignSelect(s.id)}
              />
              {s.title}
              <span className="course-meta" style={{ marginLeft: "auto" }}>
                {s.course ? s.course.title : "Unassigned"}
              </span>
            </label>
          ))}
          {assignableSubjects.length === 0 && (
            <p className="course-meta">
              No other subjects available — create one above, or add more from Admin → Subjects.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn btn--primary"
          disabled={selectedToAssign.length === 0 || assignSubject.isPending}
          onClick={handleAssignSelected}
          style={{ marginTop: 12 }}
        >
          {assignSubject.isPending
            ? "Assigning..."
            : `Assign ${selectedToAssign.length || ""} to this course`.trim()}
        </button>
      </div>
    </section>
  );
}

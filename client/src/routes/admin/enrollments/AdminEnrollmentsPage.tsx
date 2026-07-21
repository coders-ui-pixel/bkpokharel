import { useState } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import {
  useCourses,
  useEnrollmentRequestsForAdmin,
  usePendingEnrollmentCount,
  useReviewEnrollmentRequest,
} from "../../../features/courses/hooks";
import { assetUrl } from "../../../lib/assetUrl";
import type { EnrollmentStatus } from "../../../features/courses/types";

const TABS: { label: string; value: EnrollmentStatus | undefined }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: undefined },
];

export function AdminEnrollmentsPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [tab, setTab] = useState<EnrollmentStatus | undefined>("pending");

  const { data: enrollments, isLoading } = useEnrollmentRequestsForAdmin({
    status: tab,
    courseId: courseId ?? undefined,
  });
  const { data: pendingForCourse } = usePendingEnrollmentCount(!!courseId, courseId ?? undefined);
  const review = useReviewEnrollmentRequest();

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="✅"
        title="Enrollment Requests"
        subtitle="Choose a course to review its enrollment requests — always shown per course, never mixed together."
        stats={enrollments && courseId ? [{ label: "In view", value: enrollments.length }] : undefined}
      />

      <div className="admin-panel">
      <div className="admin-form">
        <label>
          Course
          <select
            value={courseId ?? ""}
            onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select a course...</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
                {c.isPaid ? ` (Paid — Rs. ${c.price})` : " (Free)"}
              </option>
            ))}
          </select>
        </label>
      </div>
      </div>

      {!courseId && <p className="practice-empty">Select a course above to see its enrollment requests.</p>}

      {courseId && (
        <>
          {!!pendingForCourse && (
            <p className="badge badge--pending">{pendingForCourse} pending for this course</p>
          )}

          <div className="admin-tabs">
            {TABS.map((t) => (
              <button
                key={t.label}
                type="button"
                className={tab === t.value ? "is-active" : ""}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && <p>Loading...</p>}
          {enrollments?.length === 0 && <p>No requests here.</p>}

          <div className="enrollment-request-list">
            {enrollments?.map((e) => (
              <div key={e.id} className="enrollment-request-card">
                <div className="enrollment-request-card__info">
                  <strong>{e.user.name}</strong>
                  <span className="course-meta">{e.user.email}</span>
                  <span className="course-meta">Phone: {e.phone}</span>
                  {e.user.college && <span className="course-meta">College: {e.user.college}</span>}
                  {e.coupon && (
                    <span className="course-meta">
                      Coupon: <strong>{e.coupon.code}</strong> (-{e.coupon.discountPercent}%) → Paid Rs.{" "}
                      {e.discountedPrice}
                    </span>
                  )}
                  <span className={`badge ${e.status === "pending" ? "badge--pending" : ""}`}>
                    {e.status}
                  </span>
                </div>

                {e.paymentProofImagePath && (
                  <a
                    href={assetUrl(e.paymentProofImagePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="enrollment-request-card__proof"
                  >
                    <img src={assetUrl(e.paymentProofImagePath)} alt="Payment proof" />
                    <span>View full size</span>
                  </a>
                )}

                {e.status === "pending" && (
                  <div className="enrollment-request-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ id: e.id, decision: "approved" })}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ id: e.id, decision: "rejected" })}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

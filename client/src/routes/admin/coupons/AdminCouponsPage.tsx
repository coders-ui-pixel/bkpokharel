import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "../../../features/coupons/hooks";
import type { Coupon } from "../../../features/coupons/types";

function extractErrorMessage(err: unknown): string {
  if (!isAxiosError<{ message?: string }>(err)) return "Something went wrong.";
  return err.response?.data?.message ?? "Something went wrong.";
}

interface FormState {
  code: string;
  name: string;
  discountPercent: string;
  maxUses: string;
  courseIds: number[];
}

const EMPTY_FORM: FormState = { code: "", name: "", discountPercent: "10", maxUses: "", courseIds: [] };

export function AdminCouponsPage() {
  const { data: courses } = useCourses();
  const paidCourses = courses?.filter((c) => c.isPaid) ?? [];
  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  function toggleCourse(id: number) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter((c) => c !== id) : [...f.courseIds, id],
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const discountPercent = Number(form.discountPercent);
    if (!form.code.trim() || !form.name.trim()) {
      setError("Please enter both a coupon name and code.");
      return;
    }
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      setError("Discount percentage must be between 1 and 100.");
      return;
    }
    if (form.courseIds.length === 0) {
      setError("Select at least one course this coupon applies to.");
      return;
    }

    try {
      await createCoupon.mutateAsync({
        code: form.code.trim(),
        name: form.name.trim(),
        discountPercent,
        maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
        courseIds: form.courseIds,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  function courseTitles(coupon: Coupon) {
    return coupon.courses.map((c) => c.course.title).join(", ") || "—";
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🏷️"
        title="Coupons"
        subtitle="Create discount codes for paid courses — assign to one or more courses, cap total uses, and toggle them on or off."
        stats={
          coupons
            ? [
                { label: "Coupons", value: coupons.length },
                { label: "Active", value: coupons.filter((c) => c.isActive).length },
              ]
            : undefined
        }
      />

      <div className="admin-panel">
        <h2 style={{ marginTop: 0 }}>Create a coupon</h2>
        {paidCourses.length === 0 ? (
          <p className="course-meta">
            No paid courses yet — mark a course as paid (Admin → Courses) before creating a coupon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 560 }}>
            <label>
              Coupon name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. New Year Sale"
                maxLength={120}
                required
              />
            </label>
            <label>
              Coupon code
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. NEWYEAR20"
                maxLength={40}
                required
              />
            </label>
            <label>
              Discount percentage
              <input
                type="number"
                min={1}
                max={100}
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                required
              />
            </label>
            <label>
              Usage limit (leave blank for unlimited)
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Unlimited"
              />
            </label>
            <label>
              Applies to courses
              <div className="coupon-course-picker">
                {paidCourses.map((c) => (
                  <label key={c.id} className="coupon-course-picker__item">
                    <input
                      type="checkbox"
                      checked={form.courseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    {c.title}
                  </label>
                ))}
              </div>
            </label>
            <button type="submit" className="btn btn--primary" disabled={createCoupon.isPending}>
              {createCoupon.isPending ? "Creating..." : "+ Create coupon"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}
      </div>

      <div className="admin-panel">
        <h2 style={{ marginTop: 0 }}>All coupons</h2>
        {isLoading && <p>Loading...</p>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Discount</th>
              <th>Courses</th>
              <th>Uses</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.code}</strong>
                </td>
                <td>{c.name}</td>
                <td>{c.discountPercent}%</td>
                <td>{courseTitles(c)}</td>
                <td>
                  {c.usedCount}
                  {c.maxUses !== null ? ` / ${c.maxUses}` : " / ∞"}
                </td>
                <td>
                  <span className={`badge ${c.isActive ? "" : "badge--pending"}`}>
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => updateCoupon.mutate({ id: c.id, input: { isActive: !c.isActive } })}
                  >
                    {c.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      if (confirm(`Delete coupon "${c.code}"?`)) deleteCoupon.mutate(c.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons?.length === 0 && (
              <tr>
                <td colSpan={7}>No coupons yet — create one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

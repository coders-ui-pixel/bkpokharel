import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfileRequest } from "../../features/auth/api";
import { useCourse, useMyEnrollmentForCourse, useRequestEnrollment } from "../../features/courses/hooks";
import { useValidateCoupon } from "../../features/coupons/hooks";
import type { CouponPreview } from "../../features/coupons/types";
import { assetUrl } from "../../lib/assetUrl";

function extractErrorMessage(err: unknown): string {
  if (!isAxiosError<{ message?: string; details?: { fieldErrors?: Record<string, string[]> } }>(err)) {
    return "Could not submit your enrollment request.";
  }
  const data = err.response?.data;
  const fieldErrors = data?.details?.fieldErrors;
  if (fieldErrors) {
    const firstField = Object.keys(fieldErrors)[0];
    const firstMessage = firstField ? fieldErrors[firstField]?.[0] : undefined;
    if (firstMessage) return firstMessage;
  }
  return data?.message ?? "Could not submit your enrollment request.";
}

const CHECKOUT_FORM_ID = "course-checkout-form";

export function CourseCheckoutPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const { user, setUser } = useAuth();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: enrollment } = useMyEnrollmentForCourse(courseId);
  const requestEnrollment = useRequestEnrollment();
  const validateCoupon = useValidateCoupon();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [college, setCollege] = useState(user?.college ?? "");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (isLoading) return <p>Loading...</p>;
  if (!course) return <p>Course not found.</p>;
  if (enrollment?.status === "approved" || enrollment?.status === "pending") {
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  function handleProofChange(file: File | null) {
    setProofFile(file);
    setProofPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) return;
    try {
      const preview = await validateCoupon.mutateAsync({ code: couponInput.trim(), courseId });
      setAppliedCoupon(preview);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(extractErrorMessage(err));
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (phone.trim().length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!college.trim()) {
      setError("Please enter your college/institution name.");
      return;
    }
    if (course!.isPaid && !proofFile) {
      setError("Please upload a payment screenshot as proof before submitting.");
      return;
    }

    try {
      const updatedUser = await updateProfileRequest({
        name: name.trim(),
        phone: phone.trim(),
        college: college.trim(),
      });
      setUser(updatedUser);

      await requestEnrollment.mutateAsync({
        courseId,
        phone: phone.trim(),
        paymentProof: proofFile,
        couponCode: appliedCoupon?.code,
      });
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (submitted) {
    return (
      <section className="checkout-page checkout-page--done">
        <div className="checkout-done">
          <div className="checkout-done__icon">✓</div>
          <h1>Request submitted</h1>
          <p className="badge badge--pending">Pending admin verification</p>
          <p>
            We've received your enrollment request for <strong>{course.title}</strong>. An admin
            will review it shortly — you'll gain access once it's approved.
          </p>
          <Link to="/dashboard/courses" className="btn btn--primary">
            Back to my courses
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p className="course-meta">Enrolling in "{course.title}"</p>
        {course.isPaid && (
          <div className="checkout-steps">
            <span className="checkout-steps__step is-active">1. Your details</span>
            <span className="checkout-steps__divider" />
            <span className="checkout-steps__step is-active">2. Payment</span>
          </div>
        )}
      </div>

      <div className="checkout-grid">
        <form id={CHECKOUT_FORM_ID} onSubmit={handleSubmit} className="checkout-main">
          <div className="checkout-card">
            <h2>Your details</h2>
            <div className="admin-form" style={{ maxWidth: "none", margin: 0 }}>
              <div className="auth-form__row">
                <label>
                  Full name
                  <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
                </label>
                <label>
                  Phone number
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={30} />
                </label>
              </div>
              <label>
                College / Institution
                <input value={college} onChange={(e) => setCollege(e.target.value)} required maxLength={200} />
              </label>
            </div>
          </div>

          {course.isPaid && (
            <div className="checkout-card">
              <h2>Coupon code</h2>
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <div>
                    <strong>{appliedCoupon.code}</strong> applied — {appliedCoupon.discountPercent}% off (
                    {appliedCoupon.name})
                  </div>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="admin-form admin-form--inline" style={{ margin: 0 }}>
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    maxLength={40}
                  />
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleApplyCoupon}
                    disabled={validateCoupon.isPending || !couponInput.trim()}
                  >
                    {validateCoupon.isPending ? "Checking..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="form-error">{couponError}</p>}
            </div>
          )}

          {course.isPaid && (
            <div className="checkout-card">
              <h2>Payment</h2>
              <p className="course-meta">
                Scan the QR code below to pay Rs. {appliedCoupon ? appliedCoupon.discountedPrice : course.price},
                then upload a screenshot of your payment as proof.
              </p>
              <div className="checkout-payment">
                {course.paymentQrImagePath ? (
                  <img
                    src={assetUrl(course.paymentQrImagePath)}
                    alt="Payment QR code"
                    className="checkout-payment__qr"
                  />
                ) : (
                  <p className="form-error">
                    No payment QR code has been uploaded for this course yet — contact support.
                  </p>
                )}

                <label className="checkout-upload">
                  {proofPreview ? (
                    <img src={proofPreview} alt="Payment proof preview" className="checkout-upload__preview" />
                  ) : (
                    <span className="checkout-upload__placeholder">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      Upload payment screenshot
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProofChange(e.target.files?.[0] ?? null)}
                    required
                  />
                </label>
              </div>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}
        </form>

        <aside className="checkout-summary">
          <div className="checkout-summary__thumb">
            {course.coverImageUrl ? (
              <img src={assetUrl(course.coverImageUrl)} alt={course.title} />
            ) : (
              <div className="checkout-summary__thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6 2h9l3 3v17H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 11h6M9 15h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
          <div className="checkout-summary__body">
            <h2>{course.title}</h2>
            <p className="course-meta">{course._count?.subjects ?? 0} subjects</p>
            <div className="checkout-summary__row">
              <span>Price</span>
              <span>
                {course.isPaid ? (
                  appliedCoupon ? (
                    <s className="checkout-summary__struck">Rs. {course.price}</s>
                  ) : (
                    `Rs. ${course.price}`
                  )
                ) : (
                  "Free"
                )}
              </span>
            </div>
            {course.isPaid && appliedCoupon && (
              <div className="checkout-summary__row">
                <span>Discount ({appliedCoupon.discountPercent}%)</span>
                <span>
                  − Rs. {(Number(course.price) - appliedCoupon.discountedPrice).toFixed(2)}
                </span>
              </div>
            )}
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>
                {course.isPaid
                  ? `Rs. ${appliedCoupon ? appliedCoupon.discountedPrice : course.price}`
                  : "Rs. 0"}
              </span>
            </div>
            <button
              type="submit"
              form={CHECKOUT_FORM_ID}
              className="btn btn--primary btn--lg btn--block"
              disabled={requestEnrollment.isPending}
            >
              {requestEnrollment.isPending ? "Processing..." : "Checkout"}
            </button>
            <p className="checkout-summary__note">
              Your request is reviewed by an admin before you get access — you'll see it in "My
              Courses" once approved.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { assetUrl } from "../../../lib/assetUrl";
import {
  useAllHeroImages,
  useCreateHeroImage,
  useDeleteHeroImage,
  useReorderHeroImages,
  useReplaceHeroImage,
  useUpdateHeroImage,
} from "../../../features/homepage/hooks";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";

const SLOT_LABELS = ["Hero image 1", "Hero image 2", "Hero image 3", "Hero image 4"];

function DashboardBannerSection() {
  const { data: banners, isLoading } = useAllHeroImages("dashboard");
  const createImage = useCreateHeroImage();
  const updateImage = useUpdateHeroImage();
  const deleteImage = useDeleteHeroImage();
  const reorderImages = useReorderHeroImages();

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [pendingUpload, setPendingUpload] = useState(false);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    const file = uploadInputRef.current?.files?.[0];
    if (!file || !title.trim()) return;
    setPendingUpload(true);
    try {
      await createImage.mutateAsync({ file, title: title.trim(), placement: "dashboard" });
      setTitle("");
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    } finally {
      setPendingUpload(false);
    }
  }

  function move(index: number, direction: "up" | "down") {
    if (!banners) return;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= banners.length) return;
    const ordered = [...banners];
    [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
    reorderImages.mutate(ordered.map((b) => b.id));
  }

  return (
    <div className="admin-panel" style={{ marginTop: 24 }}>
      <h2 className="admin-section__heading">Dashboard welcome banner</h2>
      <p className="course-meta">
        Upload one or more images to auto-play as a slideshow in the student dashboard's welcome
        banner. Add as many as you like — they'll cycle in this order.
      </p>

      <form onSubmit={handleUpload} className="admin-form admin-form--inline" style={{ marginTop: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Banner title (e.g. New Year Sale)"
          maxLength={150}
        />
        <input ref={uploadInputRef} type="file" accept="image/*" required />
        <button type="submit" className="btn btn--primary" disabled={pendingUpload || !title.trim()}>
          {pendingUpload ? "Uploading..." : "+ Add banner image"}
        </button>
      </form>

      {isLoading && <p>Loading...</p>}

      <div className="dashboard-banner-list">
        {banners?.map((banner, i) => (
          <div key={banner.id} className="dashboard-banner-row">
            <img src={assetUrl(banner.imagePath)} alt={banner.title} className="dashboard-banner-row__thumb" />
            <div className="dashboard-banner-row__body">
              <strong>{banner.title}</strong>
              <span className={`badge ${banner.isEnabled ? "" : "badge--pending"}`}>
                {banner.isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="dashboard-banner-row__actions">
              <button type="button" className="btn btn--ghost btn--sm" disabled={i === 0} onClick={() => move(i, "up")}>
                ↑
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={i === banners.length - 1}
                onClick={() => move(i, "down")}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => updateImage.mutate({ id: banner.id, input: { isEnabled: !banner.isEnabled } })}
              >
                {banner.isEnabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  if (confirm(`Remove "${banner.title}"?`)) deleteImage.mutate(banner.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {banners?.length === 0 && !isLoading && (
          <p className="course-meta">No banner images yet — add one above.</p>
        )}
      </div>
    </div>
  );
}

export function AdminHomepagePage() {
  const { data: images, isLoading } = useAllHeroImages();
  const createImage = useCreateHeroImage();
  const updateImage = useUpdateHeroImage();
  const replaceImage = useReplaceHeroImage();
  const deleteImage = useDeleteHeroImage();

  const uploadInputRef = useRef<Record<number, HTMLInputElement | null>>({});
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  async function handleSlotFile(slot: number, file: File) {
    const existing = images?.[slot];
    if (existing) {
      replaceImage.mutate({ id: existing.id, file });
    } else {
      setPendingSlot(slot);
      await createImage.mutateAsync({ file, title: SLOT_LABELS[slot] });
      setPendingSlot(null);
    }
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🖼️"
        title="Homepage hero images"
        subtitle="Four floating photo cards appear on the homepage hero, in this exact order. Upload or replace each one individually — changes reflect on the homepage immediately."
        stats={[{ label: "Slots filled", value: images?.filter(Boolean).length ?? 0 }]}
      />

      {isLoading && <p>Loading...</p>}

      <div className="hero-slot-grid">
        {SLOT_LABELS.map((label, slot) => {
          const image = images?.[slot];
          return (
            <div key={slot} className="hero-slot-card">
              <h2>{label}</h2>
              <div className={`hero-slot-card__preview ${image?.isEnabled === false ? "is-disabled" : ""}`}>
                {image ? (
                  <img src={assetUrl(image.imagePath)} alt={image.title} />
                ) : (
                  <div className="hero-slot-card__empty">No image uploaded</div>
                )}
              </div>

              <input
                ref={(el) => {
                  uploadInputRef.current[slot] = el;
                }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleSlotFile(slot, file);
                  e.target.value = "";
                }}
              />

              <div className="hero-slot-card__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={pendingSlot === slot}
                  onClick={() => uploadInputRef.current[slot]?.click()}
                >
                  {pendingSlot === slot ? "Uploading..." : image ? "Replace image" : "Upload image"}
                </button>
                {image && (
                  <>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() =>
                        updateImage.mutate({ id: image.id, input: { isEnabled: !image.isEnabled } })
                      }
                    >
                      {image.isEnabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => {
                        if (confirm(`Remove ${label}?`)) deleteImage.mutate(image.id);
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DashboardBannerSection />
    </section>
  );
}

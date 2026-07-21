import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { assetUrl } from "../../../lib/assetUrl";
import {
  useSiteSettings,
  useUpdateSiteSettings,
  useUploadFavicon,
  useUploadLogo,
} from "../../../features/siteSettings/hooks";

export function AdminBrandingPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const uploadLogo = useUploadLogo();
  const uploadFavicon = useUploadFavicon();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    siteName: string;
    themePrimaryColor: string;
    themeSecondaryColor: string;
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    youtubeUrl: string;
  } | null>(null);

  if (settings && !form) {
    setForm({
      siteName: settings.siteName,
      themePrimaryColor: settings.themePrimaryColor,
      themeSecondaryColor: settings.themeSecondaryColor,
      facebookUrl: settings.facebookUrl ?? "",
      instagramUrl: settings.instagramUrl ?? "",
      tiktokUrl: settings.tiktokUrl ?? "",
      youtubeUrl: settings.youtubeUrl ?? "",
    });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    await updateSettings.mutateAsync({
      siteName: form.siteName,
      themePrimaryColor: form.themePrimaryColor,
      themeSecondaryColor: form.themeSecondaryColor,
      facebookUrl: form.facebookUrl || null,
      instagramUrl: form.instagramUrl || null,
      tiktokUrl: form.tiktokUrl || null,
      youtubeUrl: form.youtubeUrl || null,
    });
  }

  if (isLoading || !form) return <p>Loading...</p>;

  return (
    <section>
      <h1>Branding & theme</h1>
      <p className="course-meta">
        Site name, logo, favicon, theme colors, and social links used across the public site.
      </p>

      <div className="admin-course-detail-grid">
        <div className="checkout-card">
          <h2>Site identity</h2>
          <form onSubmit={handleSave} className="admin-form">
            <label>
              Site name
              <input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                required
              />
            </label>
            <label>
              Primary theme color
              <input
                type="color"
                value={form.themePrimaryColor}
                onChange={(e) => setForm({ ...form, themePrimaryColor: e.target.value })}
              />
            </label>
            <label>
              Secondary theme color
              <input
                type="color"
                value={form.themeSecondaryColor}
                onChange={(e) => setForm({ ...form, themeSecondaryColor: e.target.value })}
              />
            </label>
            <button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <div className="checkout-card">
          <h2>Logo</h2>
          {settings?.logoImagePath ? (
            <img src={assetUrl(settings.logoImagePath)} alt="Logo" className="admin-cover-preview" />
          ) : (
            <p className="course-meta">No logo uploaded yet.</p>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadLogo.mutate(file);
              e.target.value = "";
            }}
          />
          <button type="button" className="btn btn--ghost" onClick={() => logoInputRef.current?.click()}>
            {settings?.logoImagePath ? "Replace logo" : "Upload logo"}
          </button>

          <h2 style={{ marginTop: 20 }}>Favicon</h2>
          {settings?.faviconImagePath ? (
            <img
              src={assetUrl(settings.faviconImagePath)}
              alt="Favicon"
              style={{ width: 48, height: 48, objectFit: "contain" }}
            />
          ) : (
            <p className="course-meta">No favicon uploaded yet.</p>
          )}
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFavicon.mutate(file);
              e.target.value = "";
            }}
          />
          <div>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => faviconInputRef.current?.click()}
            >
              {settings?.faviconImagePath ? "Replace favicon" : "Upload favicon"}
            </button>
          </div>
        </div>
      </div>

      <div className="checkout-card">
        <h2>Social links (shown in the footer)</h2>
        <form onSubmit={handleSave} className="admin-form">
          <label>
            Facebook URL
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/yourpage"
            />
          </label>
          <label>
            Instagram URL
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/yourpage"
            />
          </label>
          <label>
            TikTok URL
            <input
              type="url"
              value={form.tiktokUrl}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@yourpage"
            />
          </label>
          <label>
            YouTube URL
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/@yourchannel"
            />
          </label>
          <button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save social links"}
          </button>
        </form>
      </div>
    </section>
  );
}

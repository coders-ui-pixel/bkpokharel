import { useEffect } from "react";
import { useSiteSettings } from "../../features/siteSettings/hooks";
import { assetUrl } from "../../lib/assetUrl";

export function BrandingApplier() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    document.title = settings.siteName;
    document.documentElement.style.setProperty("--color-primary", settings.themePrimaryColor);
    document.documentElement.style.setProperty("--color-secondary", settings.themeSecondaryColor);

    if (settings.faviconImagePath) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = assetUrl(settings.faviconImagePath);
    }
  }, [settings]);

  return null;
}

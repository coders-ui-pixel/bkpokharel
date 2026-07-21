export interface SiteSettings {
  id: number;
  siteName: string;
  logoImagePath: string | null;
  faviconImagePath: string | null;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  updatedAt: string;
}

export interface UpdateSiteSettingsInput {
  siteName?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
}

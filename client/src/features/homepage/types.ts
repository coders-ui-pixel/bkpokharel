export type HeroImagePlacement = "public_home" | "dashboard";

export interface HeroImage {
  id: number;
  image: string;
  title: string;
}

export interface AdminHeroImage {
  id: number;
  imagePath: string;
  title: string;
  placement: HeroImagePlacement;
  orderIndex: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

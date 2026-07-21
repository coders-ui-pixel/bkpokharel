export type AnnouncementType = "banner" | "popup";

export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: AnnouncementType;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  type: AnnouncementType;
  startsAt: string;
  endsAt: string;
  sendEmail?: boolean;
  sendNotification?: boolean;
}

export interface UpdateAnnouncementInput {
  title?: string;
  body?: string;
  type?: AnnouncementType;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

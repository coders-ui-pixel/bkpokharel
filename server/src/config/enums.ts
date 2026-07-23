// Hand-transcribed from the former server/prisma/schema.prisma enum blocks.
// These mirror MySQL native ENUM columns already present in the database —
// no schema change, just the TypeScript-side mirror Prisma used to generate.

export const ROLE_VALUES = ["user", "admin"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const ADMIN_ROLE_VALUES = [
  "super_admin",
  "admin",
  "instructor",
  "content_manager",
  "moderator",
] as const;
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];

export const DIFFICULTY_VALUES = ["easy", "medium", "hard", "mixed"] as const;
export type Difficulty = (typeof DIFFICULTY_VALUES)[number];

export const CORRECT_OPTION_VALUES = ["A", "B", "C", "D"] as const;
export type CorrectOption = (typeof CORRECT_OPTION_VALUES)[number];

export const ENROLLMENT_STATUS_VALUES = ["pending", "approved", "rejected"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUS_VALUES)[number];

export const FLASH_CARD_STATUS_VALUES = ["new", "known", "difficult"] as const;
export type FlashCardStatus = (typeof FLASH_CARD_STATUS_VALUES)[number];

export const ATTEMPT_STATUS_VALUES = ["in_progress", "submitted"] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUS_VALUES)[number];

export const HERO_IMAGE_PLACEMENT_VALUES = ["public_home", "dashboard"] as const;
export type HeroImagePlacement = (typeof HERO_IMAGE_PLACEMENT_VALUES)[number];

export const LIVE_EXAM_STATUS_VALUES = ["scheduled", "live", "completed", "cancelled"] as const;
export type LiveExamStatus = (typeof LIVE_EXAM_STATUS_VALUES)[number];

export const STUDY_TASK_PRIORITY_VALUES = ["low", "medium", "high"] as const;
export type StudyTaskPriority = (typeof STUDY_TASK_PRIORITY_VALUES)[number];

export const NOTIFICATION_TYPE_VALUES = ["info", "success", "warning", "error"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];

export const BOOKMARK_CONTENT_TYPE_VALUES = ["note", "important_question"] as const;
export type BookmarkContentType = (typeof BOOKMARK_CONTENT_TYPE_VALUES)[number];

export const CALENDAR_EVENT_TYPE_VALUES = ["class", "exam", "holiday", "other"] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPE_VALUES)[number];

export const RECURRENCE_FREQUENCY_VALUES = ["daily", "weekly", "monthly"] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCY_VALUES)[number];

export const ANNOUNCEMENT_TYPE_VALUES = ["banner", "popup"] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPE_VALUES)[number];

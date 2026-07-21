export type CalendarEventType = "class" | "exam" | "holiday" | "other";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly";

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  type: CalendarEventType;
  startsAt: string;
  endsAt: string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceEndDate: string | null;
  courseId: number | null;
  course?: { title: string } | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventOccurrence extends CalendarEvent {
  occurrenceStart: string;
  occurrenceEnd: string;
  courseTitle: string | null;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  type: CalendarEventType;
  startsAt: string;
  endsAt: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  courseId?: number;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  type?: CalendarEventType;
  startsAt?: string;
  endsAt?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  courseId?: number | null;
}

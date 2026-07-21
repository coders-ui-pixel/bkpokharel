import { apiClient } from "../../lib/apiClient";
import type {
  CalendarEvent,
  CalendarEventOccurrence,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "./types";

export async function fetchCalendarEventsForRange(
  from: string,
  to: string
): Promise<CalendarEventOccurrence[]> {
  const { data } = await apiClient.get<{ events: CalendarEventOccurrence[] }>("/calendar-events", {
    params: { from, to },
  });
  return data.events;
}

export async function fetchAllCalendarEvents(): Promise<CalendarEvent[]> {
  const { data } = await apiClient.get<{ events: CalendarEvent[] }>("/calendar-events/admin");
  return data.events;
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const { data } = await apiClient.post<{ event: CalendarEvent }>("/calendar-events", input);
  return data.event;
}

export async function updateCalendarEvent(
  id: number,
  input: UpdateCalendarEventInput
): Promise<CalendarEvent> {
  const { data } = await apiClient.put<{ event: CalendarEvent }>(`/calendar-events/${id}`, input);
  return data.event;
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  await apiClient.delete(`/calendar-events/${id}`);
}

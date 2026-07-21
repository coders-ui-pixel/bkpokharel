import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as calendarEventsApi from "./api";
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from "./types";

export function useCalendarEventsForRange(from: string, to: string) {
  return useQuery({
    queryKey: ["calendar-events", from, to],
    queryFn: () => calendarEventsApi.fetchCalendarEventsForRange(from, to),
    enabled: Boolean(from && to),
  });
}

export function useAllCalendarEvents() {
  return useQuery({
    queryKey: ["calendar-events", "admin"],
    queryFn: calendarEventsApi.fetchAllCalendarEvents,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCalendarEventInput) => calendarEventsApi.createCalendarEvent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCalendarEventInput }) =>
      calendarEventsApi.updateCalendarEvent(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarEventsApi.deleteCalendarEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

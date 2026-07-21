import { CalendarEvent, RecurrenceFrequency } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateCalendarEventInput, UpdateCalendarEventInput } from "./schema";

function addInterval(date: Date, freq: RecurrenceFrequency): Date {
  const next = new Date(date);
  if (freq === "daily") next.setDate(next.getDate() + 1);
  else if (freq === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

export interface EventOccurrence extends CalendarEvent {
  occurrenceStart: Date;
  occurrenceEnd: Date;
  courseTitle?: string | null;
}

function expandOccurrences(
  event: CalendarEvent & { course?: { title: string } | null },
  rangeStart: Date,
  rangeEnd: Date
): EventOccurrence[] {
  const durationMs = event.endsAt.getTime() - event.startsAt.getTime();

  if (!event.isRecurring || !event.recurrenceFrequency) {
    if (event.startsAt <= rangeEnd && event.endsAt >= rangeStart) {
      return [
        {
          ...event,
          occurrenceStart: event.startsAt,
          occurrenceEnd: event.endsAt,
          courseTitle: event.course?.title ?? null,
        },
      ];
    }
    return [];
  }

  const occurrences: EventOccurrence[] = [];
  let cursor = new Date(event.startsAt);
  const limit =
    event.recurrenceEndDate && event.recurrenceEndDate < rangeEnd ? event.recurrenceEndDate : rangeEnd;

  let iterations = 0;
  while (cursor <= limit && iterations < 500) {
    const occEnd = new Date(cursor.getTime() + durationMs);
    if (cursor <= rangeEnd && occEnd >= rangeStart) {
      occurrences.push({
        ...event,
        occurrenceStart: new Date(cursor),
        occurrenceEnd: occEnd,
        courseTitle: event.course?.title ?? null,
      });
    }
    cursor = addInterval(cursor, event.recurrenceFrequency);
    iterations++;
  }
  return occurrences;
}

export async function listForRange(
  rangeStart: Date,
  rangeEnd: Date,
  visibleCourseIds: number[] | "all"
) {
  const events = await prisma.calendarEvent.findMany({
    where: {
      startsAt: { lte: rangeEnd },
      OR: [{ recurrenceEndDate: null }, { recurrenceEndDate: { gte: rangeStart } }],
      AND:
        visibleCourseIds === "all"
          ? undefined
          : [{ OR: [{ courseId: null }, { courseId: { in: visibleCourseIds } }] }],
    },
    include: { course: { select: { title: true } } },
    orderBy: { startsAt: "asc" },
  });

  const occurrences = events
    .filter((e) => e.isRecurring || e.endsAt >= rangeStart)
    .flatMap((e) => expandOccurrences(e, rangeStart, rangeEnd));

  occurrences.sort((a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime());
  return occurrences;
}

export async function listAllForAdmin() {
  return prisma.calendarEvent.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { startsAt: "desc" },
  });
}

export async function create(input: CreateCalendarEventInput, createdBy: number) {
  return prisma.calendarEvent.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isRecurring: input.isRecurring,
      recurrenceFrequency: input.isRecurring ? input.recurrenceFrequency : undefined,
      recurrenceEndDate: input.isRecurring ? input.recurrenceEndDate : undefined,
      courseId: input.courseId,
      createdBy,
    },
  });
}

export async function update(id: number, input: UpdateCalendarEventInput) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Event not found");

  return prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isRecurring !== undefined ? { isRecurring: input.isRecurring } : {}),
      ...(input.recurrenceFrequency !== undefined
        ? { recurrenceFrequency: input.recurrenceFrequency }
        : {}),
      ...(input.recurrenceEndDate !== undefined ? { recurrenceEndDate: input.recurrenceEndDate } : {}),
      ...(input.courseId !== undefined ? { courseId: input.courseId } : {}),
    },
  });
}

export async function remove(id: number) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Event not found");
  await prisma.calendarEvent.delete({ where: { id } });
}

import type { Selectable } from "kysely";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import type { CalendarEvents } from "../../config/db-types";
import type { RecurrenceFrequency } from "../../config/enums";
import { CreateCalendarEventInput, UpdateCalendarEventInput } from "./schema";

type CalendarEvent = Selectable<CalendarEvents> & { courseTitle?: string | null };

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

function expandOccurrences(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): EventOccurrence[] {
  const durationMs = event.endsAt.getTime() - event.startsAt.getTime();

  if (!event.isRecurring || !event.recurrenceFrequency) {
    if (event.startsAt <= rangeEnd && event.endsAt >= rangeStart) {
      return [
        {
          ...event,
          occurrenceStart: event.startsAt,
          occurrenceEnd: event.endsAt,
          courseTitle: event.courseTitle ?? null,
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
        courseTitle: event.courseTitle ?? null,
      });
    }
    cursor = addInterval(cursor, event.recurrenceFrequency);
    iterations++;
  }
  return occurrences;
}

export async function listForRange(rangeStart: Date, rangeEnd: Date, visibleCourseIds: number[] | "all") {
  let query = db
    .selectFrom("calendarEvents")
    .leftJoin("courses", "courses.id", "calendarEvents.courseId")
    .selectAll("calendarEvents")
    .select(["courses.title as courseTitle"])
    .where("calendarEvents.startsAt", "<=", rangeEnd)
    .where((eb) =>
      eb.or([eb("calendarEvents.recurrenceEndDate", "is", null), eb("calendarEvents.recurrenceEndDate", ">=", rangeStart)])
    );

  if (visibleCourseIds !== "all") {
    query =
      visibleCourseIds.length > 0
        ? query.where((eb) =>
            eb.or([eb("calendarEvents.courseId", "is", null), eb("calendarEvents.courseId", "in", visibleCourseIds)])
          )
        : query.where("calendarEvents.courseId", "is", null);
  }

  const events = await query.orderBy("calendarEvents.startsAt", "asc").execute();

  const occurrences = events
    .filter((e) => e.isRecurring || e.endsAt >= rangeStart)
    .flatMap((e) => expandOccurrences(e, rangeStart, rangeEnd));

  occurrences.sort((a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime());
  return occurrences;
}

export async function listAllForAdmin() {
  return db
    .selectFrom("calendarEvents")
    .leftJoin("courses", "courses.id", "calendarEvents.courseId")
    .selectAll("calendarEvents")
    .select(["courses.title as courseTitle"])
    .orderBy("calendarEvents.startsAt", "desc")
    .execute();
}

export async function create(input: CreateCalendarEventInput, createdBy: number) {
  const result = await db
    .insertInto("calendarEvents")
    .values({
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isRecurring: input.isRecurring,
      recurrenceFrequency: input.isRecurring ? input.recurrenceFrequency ?? null : null,
      recurrenceEndDate: input.isRecurring ? input.recurrenceEndDate ?? null : null,
      courseId: input.courseId ?? null,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db.selectFrom("calendarEvents").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function update(id: number, input: UpdateCalendarEventInput) {
  const existing = await db.selectFrom("calendarEvents").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Event not found");

  await db
    .updateTable("calendarEvents")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isRecurring !== undefined ? { isRecurring: input.isRecurring } : {}),
      ...(input.recurrenceFrequency !== undefined ? { recurrenceFrequency: input.recurrenceFrequency } : {}),
      ...(input.recurrenceEndDate !== undefined ? { recurrenceEndDate: input.recurrenceEndDate } : {}),
      ...(input.courseId !== undefined ? { courseId: input.courseId } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("calendarEvents").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  const existing = await db.selectFrom("calendarEvents").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Event not found");
  await db.deleteFrom("calendarEvents").where("id", "=", id).execute();
}

import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { ToggleBookmarkInput } from "./schema";

async function assertContentExists(contentType: ToggleBookmarkInput["contentType"], contentId: number) {
  if (contentType === "note") {
    const note = await db.selectFrom("notes").select("id").where("id", "=", contentId).executeTakeFirst();
    if (!note) throw new ApiError(404, "Note not found");
  } else {
    const item = await db
      .selectFrom("importantQuestions")
      .select("id")
      .where("id", "=", contentId)
      .executeTakeFirst();
    if (!item) throw new ApiError(404, "Important question item not found");
  }
}

function findBookmark(userId: number, contentType: string, contentId: number) {
  return db
    .selectFrom("bookmarks")
    .selectAll()
    .where("userId", "=", userId)
    .where("contentType", "=", contentType as "note" | "important_question")
    .where("contentId", "=", contentId)
    .executeTakeFirst();
}

export async function listForUser(userId: number) {
  const bookmarks = await db
    .selectFrom("bookmarks")
    .selectAll()
    .where("userId", "=", userId)
    .orderBy("createdAt", "desc")
    .execute();

  const noteIds = bookmarks.filter((b) => b.contentType === "note").map((b) => b.contentId);
  const iqIds = bookmarks
    .filter((b) => b.contentType === "important_question")
    .map((b) => b.contentId);

  const [notes, importantQuestions] = await Promise.all([
    noteIds.length
      ? db.selectFrom("notes").selectAll().where("id", "in", noteIds).execute()
      : Promise.resolve([]),
    iqIds.length
      ? db.selectFrom("importantQuestions").selectAll().where("id", "in", iqIds).execute()
      : Promise.resolve([]),
  ]);

  const noteMap = new Map(notes.map((n) => [n.id, n]));
  const iqMap = new Map(importantQuestions.map((i) => [i.id, i]));

  return bookmarks
    .map((b) => {
      if (b.contentType === "note") {
        const note = noteMap.get(b.contentId);
        if (!note) return null;
        return {
          id: b.id,
          contentType: b.contentType,
          contentId: b.contentId,
          createdAt: b.createdAt,
          note: { id: note.id, title: note.title, filePath: note.filePath, chapterId: note.chapterId },
        };
      }
      const item = iqMap.get(b.contentId);
      if (!item) return null;
      return {
        id: b.id,
        contentType: b.contentType,
        contentId: b.contentId,
        createdAt: b.createdAt,
        importantQuestion: {
          id: item.id,
          title: item.title,
          filePath: item.filePath,
          mimeType: item.mimeType,
          chapterId: item.chapterId,
        },
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);
}

export async function toggle(userId: number, input: ToggleBookmarkInput) {
  const existing = await findBookmark(userId, input.contentType, input.contentId);

  if (existing) {
    await db.deleteFrom("bookmarks").where("id", "=", existing.id).execute();
    return { bookmarked: false };
  }

  await assertContentExists(input.contentType, input.contentId);
  await db
    .insertInto("bookmarks")
    .values({ userId, contentType: input.contentType, contentId: input.contentId })
    .execute();
  return { bookmarked: true };
}

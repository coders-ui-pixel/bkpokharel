import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { ToggleBookmarkInput } from "./schema";

async function assertContentExists(contentType: ToggleBookmarkInput["contentType"], contentId: number) {
  if (contentType === "note") {
    const note = await prisma.note.findUnique({ where: { id: contentId } });
    if (!note) throw new ApiError(404, "Note not found");
  } else {
    const item = await prisma.importantQuestion.findUnique({ where: { id: contentId } });
    if (!item) throw new ApiError(404, "Important question item not found");
  }
}

export async function listForUser(userId: number) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const noteIds = bookmarks.filter((b) => b.contentType === "note").map((b) => b.contentId);
  const iqIds = bookmarks
    .filter((b) => b.contentType === "important_question")
    .map((b) => b.contentId);

  const [notes, importantQuestions] = await Promise.all([
    noteIds.length
      ? prisma.note.findMany({ where: { id: { in: noteIds } } })
      : Promise.resolve([]),
    iqIds.length
      ? prisma.importantQuestion.findMany({ where: { id: { in: iqIds } } })
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
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_contentType_contentId: {
        userId,
        contentType: input.contentType,
        contentId: input.contentId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await assertContentExists(input.contentType, input.contentId);
  await prisma.bookmark.create({
    data: { userId, contentType: input.contentType, contentId: input.contentId },
  });
  return { bookmarked: true };
}

import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as importantQuestionService from "./service";
import { createImportantQuestionSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const chapterId = Number(req.params.chapterId);
  if (req.user.role !== "admin") {
    await importantQuestionService.assertCanAccessChapter(req.user.id, chapterId);
  }
  const items = await importantQuestionService.listForChapter(chapterId);

  if (req.user.role === "admin") {
    const bookmarkCounts = await importantQuestionService.getBookmarkCounts(items.map((i) => i.id));
    return res.json({
      importantQuestions: items.map((i) => ({ ...i, bookmarkCount: bookmarkCounts.get(i.id) ?? 0 })),
    });
  }

  res.json({ importantQuestions: items });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (!req.file) throw new ApiError(400, "A file is required");
  const chapterId = Number(req.params.chapterId);
  const input = createImportantQuestionSchema.parse(req.body);
  const item = await importantQuestionService.create(
    chapterId,
    input,
    req.file.filename,
    req.file.mimetype,
    req.user.id
  );
  res.status(201).json({ importantQuestion: item });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await importantQuestionService.remove(id);
  res.status(204).send();
}

export async function reorder(req: Request, res: Response) {
  const id = Number(req.params.id);
  const direction = req.body.direction === "up" ? "up" : "down";
  await importantQuestionService.reorder(id, direction);
  res.status(204).send();
}

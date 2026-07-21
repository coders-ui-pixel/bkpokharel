import { Request, Response } from "express";
import * as chapterService from "./service";
import { createChapterSchema, updateChapterSchema } from "./schema";

export async function list(req: Request, res: Response) {
  const subjectId = Number(req.params.subjectId);
  const chapters = await chapterService.listChapters(subjectId);
  res.json({ chapters });
}

export async function create(req: Request, res: Response) {
  const subjectId = Number(req.params.subjectId);
  const input = createChapterSchema.parse(req.body);
  const chapter = await chapterService.createChapter(subjectId, input);
  res.status(201).json({ chapter });
}

export async function update(req: Request, res: Response) {
  const subjectId = Number(req.params.subjectId);
  const id = Number(req.params.id);
  const input = updateChapterSchema.parse(req.body);
  const chapter = await chapterService.updateChapter(subjectId, id, input);
  res.json({ chapter });
}

export async function remove(req: Request, res: Response) {
  const subjectId = Number(req.params.subjectId);
  const id = Number(req.params.id);
  await chapterService.deleteChapter(subjectId, id);
  res.status(204).send();
}

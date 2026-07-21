import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as noteService from "./service";
import { createNoteSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const chapterId = Number(req.params.chapterId);
  if (req.user.role !== "admin") {
    await noteService.assertCanAccessChapter(req.user.id, chapterId);
  }
  const notes = await noteService.listNotesForChapter(chapterId);

  if (req.user.role === "admin") {
    const bookmarkCounts = await noteService.getBookmarkCounts(notes.map((n) => n.id));
    return res.json({
      notes: notes.map((n) => ({ ...n, bookmarkCount: bookmarkCounts.get(n.id) ?? 0 })),
    });
  }

  res.json({ notes });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (!req.file) throw new ApiError(400, "A PDF file is required");
  const chapterId = Number(req.params.chapterId);
  const input = createNoteSchema.parse(req.body);
  const note = await noteService.createNote(chapterId, input, req.file.filename, req.user.id);
  res.status(201).json({ note });
}

export async function replace(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "A PDF file is required");
  const id = Number(req.params.id);
  const note = await noteService.replaceNote(id, req.file.filename);
  res.json({ note });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await noteService.deleteNote(id);
  res.status(204).send();
}

export async function reorder(req: Request, res: Response) {
  const id = Number(req.params.id);
  const direction = req.body.direction === "up" ? "up" : "down";
  await noteService.reorderNote(id, direction);
  res.status(204).send();
}

export async function streamFile(req: Request, res: Response) {
  const id = Number(req.params.id);
  const isAdmin = req.user?.role === "admin";
  const { absolutePath, title } = await noteService.getNoteFileForRequest(req.user?.id, isAdmin, id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(title)}.pdf"`);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(absolutePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ message: "File not found" });
    }
  });
}

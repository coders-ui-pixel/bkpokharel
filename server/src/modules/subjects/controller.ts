import { Request, Response } from "express";
import * as subjectService from "./service";
import {
  assignSubjectSchema,
  createStandaloneSubjectSchema,
  createSubjectSchema,
  updateSubjectSchema,
} from "./schema";

export async function list(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const subjects = await subjectService.listSubjects(courseId);
  res.json({ subjects });
}

export async function listAll(req: Request, res: Response) {
  const unassigned = req.query.unassigned === "true";
  const subjects = await subjectService.listAllSubjects({ unassigned });
  res.json({ subjects });
}

export async function createStandalone(req: Request, res: Response) {
  const input = createStandaloneSubjectSchema.parse(req.body);
  const subject = await subjectService.createStandaloneSubject(input);
  res.status(201).json({ subject });
}

export async function assign(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = assignSubjectSchema.parse(req.body);
  const subject = await subjectService.assignSubjectToCourse(id, input);
  res.json({ subject });
}

export async function updateById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateSubjectSchema.parse(req.body);
  const subject = await subjectService.updateSubjectById(id, input);
  res.json({ subject });
}

export async function removeById(req: Request, res: Response) {
  const id = Number(req.params.id);
  await subjectService.deleteSubjectById(id);
  res.status(204).send();
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const subject = await subjectService.getSubjectById(id);
  res.json({ subject });
}

export async function create(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const input = createSubjectSchema.parse(req.body);
  const subject = await subjectService.createSubject(courseId, input);
  res.status(201).json({ subject });
}

export async function update(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const id = Number(req.params.id);
  const input = updateSubjectSchema.parse(req.body);
  const subject = await subjectService.updateSubject(courseId, id, input);
  res.json({ subject });
}

export async function remove(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const id = Number(req.params.id);
  await subjectService.deleteSubject(courseId, id);
  res.status(204).send();
}

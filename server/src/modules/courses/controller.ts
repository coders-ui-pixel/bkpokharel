import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as courseService from "./service";
import { createCourseSchema, updateCourseSchema } from "./schema";

export async function list(req: Request, res: Response) {
  const includeUnpublished = req.user?.role === "admin";
  const featuredOnly = req.query.featured === "true";
  const courses = await courseService.listCourses(includeUnpublished, featuredOnly);
  res.json({ courses });
}

export async function listSyllabus(_req: Request, res: Response) {
  const courses = await courseService.listCoursesWithSyllabus();
  res.json({ courses });
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const course = await courseService.getCourseById(id);
  res.json({ course });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createCourseSchema.parse(req.body);
  const course = await courseService.createCourse(input, req.user.id);
  res.status(201).json({ course });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateCourseSchema.parse(req.body);
  const course = await courseService.updateCourse(id, input);
  res.json({ course });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await courseService.deleteCourse(id);
  res.status(204).send();
}

export async function uploadCoverImage(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const id = Number(req.params.id);
  const course = await courseService.setCoverImage(id, req.file.filename);
  res.json({ course });
}

export async function uploadPaymentQr(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const id = Number(req.params.id);
  const course = await courseService.setPaymentQr(id, req.file.filename);
  res.json({ course });
}

import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as enrollmentService from "./service";
import { requestEnrollmentSchema, reviewEnrollmentSchema } from "./schema";

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { courseId, phone, couponCode } = requestEnrollmentSchema.parse(req.body);
  const enrollment = await enrollmentService.requestEnrollment(
    req.user.id,
    courseId,
    phone,
    req.file?.filename,
    couponCode
  );
  res.status(201).json({ enrollment });
}

export async function listMine(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const enrollments = await enrollmentService.listMyEnrollments(req.user.id);
  res.json({ enrollments });
}

export async function getMine(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const courseId = Number(req.params.courseId);
  const enrollment = await enrollmentService.getMyEnrollment(req.user.id, courseId);
  res.json({ enrollment });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const courseId = Number(req.params.courseId);
  await enrollmentService.unenroll(req.user.id, courseId);
  res.status(204).send();
}

export async function listForAdmin(req: Request, res: Response) {
  const status = req.query.status as "pending" | "approved" | "rejected" | undefined;
  const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
  const enrollments = await enrollmentService.listRequestsForAdmin({ status, courseId });
  res.json({ enrollments });
}

export async function pendingCount(req: Request, res: Response) {
  const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
  const count = await enrollmentService.countPendingRequests(courseId);
  res.json({ count });
}

export async function review(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const { decision } = reviewEnrollmentSchema.parse(req.body);
  const enrollment = await enrollmentService.reviewEnrollment(id, decision, req.user.id);
  res.json({ enrollment });
}

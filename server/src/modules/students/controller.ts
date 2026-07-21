import { Request, Response } from "express";
import * as studentService from "./service";
import * as auditLogService from "../auditLogs/service";
import { suspendStudentSchema, updateStudentSchema } from "./schema";

export async function list(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const status = req.query.status as "active" | "suspended" | undefined;
  const students = await studentService.listStudents({ search, status });
  res.json({ students });
}

export async function detail(req: Request, res: Response) {
  const id = Number(req.params.id);
  const student = await studentService.getStudentDetail(id);
  res.json({ student });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateStudentSchema.parse(req.body);
  const student = await studentService.updateStudent(id, input);
  res.json({ student });
}

export async function suspend(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { isActive } = suspendStudentSchema.parse(req.body);
  await studentService.setSuspended(id, isActive);
  if (req.user) {
    await auditLogService.log(req.user.id, isActive ? "student.reactivate" : "student.suspend", "user", id);
  }
  res.status(204).send();
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await studentService.deleteStudent(id);
  if (req.user) {
    await auditLogService.log(req.user.id, "student.delete", "user", id);
  }
  res.status(204).send();
}

export async function exportCsv(_req: Request, res: Response) {
  const csv = await studentService.exportStudentsCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=students.csv");
  res.send(csv);
}

import { Request, Response } from "express";
import * as auditLogService from "./service";

export async function list(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const logs = await auditLogService.list(limit);
  res.json({ logs });
}

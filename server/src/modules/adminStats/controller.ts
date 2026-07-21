import { Request, Response } from "express";
import * as adminStatsService from "./service";

export async function getOverview(_req: Request, res: Response) {
  const overview = await adminStatsService.getOverview();
  res.json(overview);
}

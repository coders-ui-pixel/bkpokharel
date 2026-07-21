import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import * as studyPlannerController from "./controller";

// Mounted at /api/study-tasks
export const studyPlannerRouter = Router();

studyPlannerRouter.use(verifyJwt);

studyPlannerRouter.get("/", asyncHandler(studyPlannerController.list));
studyPlannerRouter.post("/", asyncHandler(studyPlannerController.create));
studyPlannerRouter.put("/:id", asyncHandler(studyPlannerController.update));
studyPlannerRouter.delete("/:id", asyncHandler(studyPlannerController.remove));

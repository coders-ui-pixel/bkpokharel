import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import * as bookmarkController from "./controller";

// Mounted at /api/bookmarks
export const bookmarkRouter = Router();

bookmarkRouter.use(verifyJwt);

bookmarkRouter.get("/", asyncHandler(bookmarkController.list));
bookmarkRouter.post("/toggle", asyncHandler(bookmarkController.toggle));

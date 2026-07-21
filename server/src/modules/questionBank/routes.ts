import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as questionBankController from "./controller";

export const questionBankRouter = Router();

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv = file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      cb(new Error("Only .csv files are allowed"));
      return;
    }
    cb(null, true);
  },
});

questionBankRouter.use(verifyJwt, requireRole("admin"));

questionBankRouter.get("/", asyncHandler(questionBankController.list));
questionBankRouter.post("/", asyncHandler(questionBankController.create));
questionBankRouter.put("/:id", asyncHandler(questionBankController.update));
questionBankRouter.delete("/:id", asyncHandler(questionBankController.remove));
questionBankRouter.post(
  "/upload-csv",
  csvUpload.single("file"),
  asyncHandler(questionBankController.uploadCsvDryRun)
);
questionBankRouter.post("/upload-csv/confirm", asyncHandler(questionBankController.uploadCsvConfirm));

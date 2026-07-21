import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { env } from "../config/env";

interface UploaderOptions {
  subdir: string;
  allowedMimePrefix: string;
  maxSizeMB: number;
}

export function createUploader({ subdir, allowedMimePrefix, maxSizeMB }: UploaderOptions) {
  const destDir = path.join(env.UPLOAD_DIR, subdir);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith(allowedMimePrefix)) {
        cb(new Error(`Only ${allowedMimePrefix}* files are allowed`));
        return;
      }
      cb(null, true);
    },
  });
}

export function publicPathFor(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}

export function deleteUploadedFile(publicPath: string) {
  const relative = publicPath.replace(/^\/uploads\//, "");
  const fullPath = path.join(env.UPLOAD_DIR, relative);
  fs.unlink(fullPath, () => {
    // ignore missing file
  });
}

// Secure uploads live outside the statically-served /uploads directory tree,
// so files can only ever be reached through an authenticated, access-checked route.
export function createSecureUploader({ subdir, allowedMimePrefix, maxSizeMB }: UploaderOptions) {
  const destDir = path.join(env.SECURE_UPLOAD_DIR, subdir);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith(allowedMimePrefix)) {
        cb(new Error(`Only ${allowedMimePrefix}* files are allowed`));
        return;
      }
      cb(null, true);
    },
  });
}

export function secureFilePathFor(subdir: string, filename: string): string {
  return path.resolve(env.SECURE_UPLOAD_DIR, subdir, filename);
}

export function deleteSecureUploadedFile(subdir: string, filename: string) {
  fs.unlink(secureFilePathFor(subdir, filename), () => {
    // ignore missing file
  });
}

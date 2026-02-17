import path from "path";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { randomUUID } from "crypto";

const MAX_SIZE = 2 * 1024 * 1024;

const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "public", "profile_pictures");
const BANNER_UPLOAD_DIR = path.join(process.cwd(), "public", "tournament_banners");

if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(BANNER_UPLOAD_DIR)) {
  fs.mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, PROFILE_UPLOAD_DIR);
    } else if (file.fieldname === "bannerImage") {
      cb(null, BANNER_UPLOAD_DIR);
    } else {
      cb(new Error("Invalid field name for upload."), "");
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    if (file.fieldname === "profilePicture") {
      const uniqueName = `pro-pic-${randomUUID()}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    } else if (file.fieldname === "bannerImage") {
      const uniqueName = `tournament-banner-${randomUUID()}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    } else {
      cb(new Error("Invalid field name for upload."), "");
    }
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.fieldname !== "profilePicture" &&
    file.fieldname !== "bannerImage"
  ) {
    return cb(new Error("Invalid field name for upload."));
  }

  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const uploadBannerImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = uploadProfilePicture;
export const upload = uploadProfilePicture;
export const uploadBanner = uploadBannerImage;
import dotenv from "dotenv";

dotenv.config();

// Environment
export const NODE_ENV = process.env.NODE_ENV as string;

// Server
export const PORT = Number(process.env.PORT) || 5050;

// MongoDB
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GoalNepal_DB";

// JWT Authentication
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRE = process.env.JWT_EXPIRE as string;
export const JWT_COOKIE_EXPIRE = Number(process.env.JWT_COOKIE_EXPIRE);

// File Uploads
export const FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH as string;
export const MAX_FILE_UPLOAD = Number(process.env.MAX_FILE_UPLOAD);

export const PROFILE_PICTURE_PATH =
  process.env.PROFILE_PICTURE_PATH as string;

export const MAX_PROFILE_PICTURE_SIZE = Number(
  process.env.MAX_PROFILE_PICTURE_SIZE
);

// CORS
export const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",") || [];

// Default Profile Picture
export const DEFAULT_PROFILE_PICTURE =
  process.env.DEFAULT_PROFILE_PICTURE as string;


// EMAIL CONFIG
export const EMAIL_USER = process.env.EMAIL_USER as string;
export const EMAIL_PASS = process.env.EMAIL_PASS as string;
export const CLIENT_URL = process.env.CLIENT_URL as string;

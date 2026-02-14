import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/env";
import { UserModel as User } from "../models/user.model";
import { AdminModel as Admin } from "../models/admin/admin.model";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAdmin?: boolean;
    }
  }
}

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let userDoc = await Admin.findById(decoded.id);
    let isAdmin = false;

    if (userDoc) {
      isAdmin = true;
    } else {
      userDoc = await User.findById(decoded.id);
      isAdmin = decoded.role === "admin" || userDoc?.role === "admin";
    }

    if (!userDoc) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: userDoc._id,
      _id: userDoc._id,
      role: isAdmin ? "admin" : "user",
    };
    req.isAdmin = isAdmin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  next();
};
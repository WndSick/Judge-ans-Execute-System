import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth.js";

interface JWTPayload {
  userId: string;
  role: "user" | "admin";
}

interface CustomError extends Error {
  statusCode?: number;
}

const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    const error: CustomError = new Error("Authorization header must be Bearer token");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    const error: CustomError = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (_error) {
    const error: CustomError = new Error("Invalid or expired token");
    error.statusCode = 401;
    next(error);
  }
};

export default authMiddleware;

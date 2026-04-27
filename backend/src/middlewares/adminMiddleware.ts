import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";

interface CustomError extends Error {
  statusCode?: number;
}

const adminMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    const error: CustomError = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== "admin") {
    const error: CustomError = new Error("Admin access required");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

export default adminMiddleware;

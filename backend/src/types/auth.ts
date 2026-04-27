import { Request } from "express";

export interface AuthUser {
  userId: string;
  role: "user" | "admin";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

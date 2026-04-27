import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error: CustomError = new Error("email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const response = await authService.registerUser(email, password);
  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error: CustomError = new Error("email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const response = await authService.loginUser(email, password);
  res.status(200).json(response);
});

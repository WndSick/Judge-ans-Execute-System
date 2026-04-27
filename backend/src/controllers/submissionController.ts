import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as submissionService from "../services/submissionService.js";
import { AuthenticatedRequest } from "../types/auth.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const createSubmission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { problemId, code, language, contestId } = req.body;

  if (!req.user) {
    const error: CustomError = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  if (!problemId || !code || !language) {
    const error: CustomError = new Error("problemId, code, and language are required");
    error.statusCode = 400;
    throw error;
  }

  const submission = await submissionService.createSubmission({
    userId: req.user.userId,
    problemId,
    code,
    language,
    contestId
  });

  res.status(201).json({ submissionId: submission._id });
});

export const getSubmissionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    const error: CustomError = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const submission = await submissionService.getSubmissionById(req.params.id as string);
  if (
    req.user.role !== "admin" &&
    submission.userId.toString() !== req.user.userId
  ) {
    const error: CustomError = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json({
    _id: submission._id,
    status: submission.status,
    result: submission.result,
    passedTestCases: submission.passedTestCases,
    totalTestCases: submission.totalTestCases,
    queueTime: submission.queueTime,
    executionTime: submission.executionTime,
    totalTime: submission.totalTime,
    message: submission.error, // Map backend 'error' to frontend 'message'
    createdAt: submission.createdAt
  });
});

export const getMySubmissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    const error: CustomError = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const submissions = await submissionService.getMySubmissions(req.user.userId);
  res.status(200).json(submissions);
});

export const getAllSubmissions = asyncHandler(async (_req: Request, res: Response) => {
  const submissions = await submissionService.getAllSubmissions();
  res.status(200).json(submissions);
});

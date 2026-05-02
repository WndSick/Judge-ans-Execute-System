import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import * as problemService from "../services/problemService.js";
import * as runService from "../services/runService.js";
import { AuthenticatedRequest } from "../types/auth.js";
import Contest from "../models/Contest.js";

interface CustomError extends Error {
  statusCode?: number;
}

const GLOBAL_RUN_LIMIT = 5;
const PER_USER_RUN_LIMIT = 1;
let activeGlobalRuns = 0;
const activeRunsPerUser = new Map<string, number>();

export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.createProblem(req.body);
  res.status(201).json(problem);
});

export const getProblems = asyncHandler(async (_req: Request, res: Response) => {
  const problems = await problemService.getProblems();
  res.status(200).json(problems);
});

export const getAllProblems = asyncHandler(async (_req: Request, res: Response) => {
  const problems = await problemService.getAllProblems();
  res.status(200).json(problems);
});

export const getProblemById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problem = await problemService.getProblemById(req.params.id as string);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }

  if (problem.isPublic || req.user?.role === "admin") {
    return res.status(200).json(problem);
  }

  const contestId = req.query.contestId as string | undefined;
  if (!contestId || !mongoose.Types.ObjectId.isValid(contestId)) {
    const error: CustomError = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const now = new Date();
  const contest = await Contest.findById(contestId);
  const isProblemInContest = contest?.problemIds.some(id => id.toString() === problem._id.toString()) ?? false;
  const isContestActive = contest ? (contest.startTime <= now && now < contest.endTime) : false;

  if (!contest || !isProblemInContest || !isContestActive) {
    const error: CustomError = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json(problem);
});

export const runProblem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    const error: CustomError = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const { code, language } = req.body as { code?: string; language?: "cpp" | "python" };
  if (!code || !language) {
    const error: CustomError = new Error("code and language are required");
    error.statusCode = 400;
    throw error;
  }
  if (language !== "cpp" && language !== "python") {
    const error: CustomError = new Error("language must be cpp or python");
    error.statusCode = 400;
    throw error;
  }

  const userId = req.user.userId;
  const userActiveRuns = activeRunsPerUser.get(userId) ?? 0;

  if (activeGlobalRuns >= GLOBAL_RUN_LIMIT || userActiveRuns >= PER_USER_RUN_LIMIT) {
    const error: CustomError = new Error("Too many run requests. Please wait a few seconds.");
    error.statusCode = 429;
    throw error;
  }

  activeGlobalRuns += 1;
  activeRunsPerUser.set(userId, userActiveRuns + 1);

  try {
    const result = await runService.runSampleTests({
      problemId: req.params.id as string,
      code,
      language
    });
    res.status(200).json(result);
  } catch (err: any) {
    if (err.statusCode) throw err;

    res.status(200).json({
      status: "error",
      runtime: 0,
      message: "Execution service unavailable or timed out"
    });
  } finally {
    activeGlobalRuns = Math.max(0, activeGlobalRuns - 1);
    const nextUserCount = Math.max(0, (activeRunsPerUser.get(userId) ?? 1) - 1);
    if (nextUserCount === 0) {
      activeRunsPerUser.delete(userId);
    } else {
      activeRunsPerUser.set(userId, nextUserCount);
    }
  }
});

export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.updateProblem(req.params.id as string, req.body);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(problem);
});

export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.deleteProblem(req.params.id as string);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(204).send();
});

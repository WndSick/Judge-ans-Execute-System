import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import * as problemService from "../services/problemService.js";
import { AuthenticatedRequest } from "../types/auth.js";
import Contest from "../models/Contest.js";

interface CustomError extends Error {
  statusCode?: number;
}

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

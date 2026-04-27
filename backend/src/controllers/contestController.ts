import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as contestService from "../services/contestService.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const getContests = asyncHandler(async (_req: Request, res: Response) => {
  const contests = await contestService.getUpcomingAndActiveContests();
  res.status(200).json(contests);
});

export const getContestById = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.getContestById(req.params.id as string);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  // If contest hasn't started, don't show problems unless user is admin? 
  // For simplicity, we just check if now < startTime in the frontend, but here we can return partial info
  if (now < contest.startTime) {
      // Check if admin
      // ... for now, return minimal
  }

  const fullContest = await contestService.getContestByIdWithProblems(req.params.id as string);
  res.status(200).json(fullContest);
});

export const createContest = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.createContest(req.body);
  res.status(201).json(contest);
});

export const updateContest = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.updateContest(req.params.id as string, req.body);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(contest);
});

export const deleteContest = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.deleteContest(req.params.id as string);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(204).send();
});

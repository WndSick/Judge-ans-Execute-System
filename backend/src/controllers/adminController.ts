import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as problemService from "../services/problemService.js";
import * as contestService from "../services/contestService.js";
import * as submissionService from "../services/submissionService.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, timeLimit, memoryLimit, testcases = [] } = req.body;
  if (!title || !description || !timeLimit || !memoryLimit) {
    const error: CustomError = new Error(
      "title, description, timeLimit, and memoryLimit are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const problem = await problemService.createProblem({
    title,
    description,
    timeLimit,
    memoryLimit,
    testcases
  });
  res.status(201).json(problem);
});

export const listProblems = asyncHandler(async (_req: Request, res: Response) => {
  const problems = await problemService.getProblems();
  res.status(200).json(problems);
});

export const getProblemById = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.getProblemById(req.params.id as string);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(problem);
});

export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.updateProblemById(req.params.id as string, req.body);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(problem);
});

export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.getProblemById(req.params.id as string);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }

  await problemService.deleteProblemById(req.params.id as string);
  res.status(200).json({ message: "Problem deleted" });
});

export const createContest = asyncHandler(async (req: Request, res: Response) => {
  const { title, startTime, endTime, problemIds = [] } = req.body;
  if (!title || !startTime || !endTime) {
    const error: CustomError = new Error("title, startTime, and endTime are required");
    error.statusCode = 400;
    throw error;
  }

  const contest = await contestService.createContest({
    title,
    startTime,
    endTime,
    problemIds
  });
  res.status(201).json(contest);
});

export const listContests = asyncHandler(async (_req: Request, res: Response) => {
  const contests = await contestService.getAllContests();
  res.status(200).json(contests);
});

export const getContestById = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.getContestByIdWithProblems(req.params.id as string);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(contest);
});

export const updateContest = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.updateContestById(req.params.id as string, req.body);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json(contest);
});

export const deleteContest = asyncHandler(async (req: Request, res: Response) => {
  const contest = await contestService.getContestById(req.params.id as string);
  if (!contest) {
    const error: CustomError = new Error("Contest not found");
    error.statusCode = 404;
    throw error;
  }

  await contestService.deleteContestById(req.params.id as string);
  res.status(200).json({ message: "Contest deleted" });
});

export const listSubmissions = asyncHandler(async (_req: Request, res: Response) => {
  const submissions = await submissionService.getAllSubmissions();
  res.status(200).json(submissions);
});

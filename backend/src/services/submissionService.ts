import Submission, { ISubmission } from "../models/Submission.js";
import Problem from "../models/Problem.js";
import Contest from "../models/Contest.js";
import submissionQueue from "../queue/submissionQueue.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const createSubmission = async ({
  userId,
  problemId,
  code,
  language,
  contestId
}: {
  userId: string;
  problemId: string;
  code: string;
  language: string;
  contestId?: string;
}): Promise<ISubmission> => {
  const problem = await Problem.findById(problemId);
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  // If problem is NOT public, it MUST be part of an active contest to be submitted
  if (!problem.isPublic) {
    const activeContest = await Contest.findOne({
      problemIds: problem._id,
      startTime: { $lte: now },
      endTime: { $gt: now }
    });

    if (!activeContest) {
      const error: CustomError = new Error("Problem is private and not part of an active contest");
      error.statusCode = 403;
      throw error;
    }

    if (!contestId || contestId !== activeContest._id.toString()) {
      const error: CustomError = new Error("contestId is required and must match the active contest for private problems");
      error.statusCode = 403;
      throw error;
    }
  } else {
    // If it is public, contestId is optional, but if provided, it must be valid for the contest context
    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (!contest || !contest.problemIds.some(id => id.toString() === problemId)) {
        const error: CustomError = new Error("Invalid contestId for this problem");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  const submission = await Submission.create({
    userId,
    problemId,
    contestId,
    code,
    language,
    status: "pending",
    result: "Pending"
  });

  await submissionQueue.add("executeSubmission", {
    submissionId: submission._id.toString(),
    code,
    language,
    problemId: problemId.toString(),
    queuedAt: Date.now()
  });

  return submission;
};

export const getSubmissionById = async (submissionId: string): Promise<ISubmission> => {
  const submission = await Submission.findById(submissionId).populate("problemId", "title");

  if (!submission) {
    const error: CustomError = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  return submission as ISubmission;
};

export const getMySubmissions = async (userId: string): Promise<ISubmission[]> => {
  return Submission.find({ userId }).populate("problemId", "title").sort({ createdAt: -1 });
};

export const getAllSubmissions = async (): Promise<ISubmission[]> => {
  return Submission.find().populate("problemId", "title").sort({ createdAt: -1 });
};

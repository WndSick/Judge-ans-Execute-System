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

  // Private problems can only be submitted within the active contest context.
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
    // Public problems support normal practice submissions without contest context.
    // If contestId is provided, validate that the contest is active and contains the problem.
    if (contestId) {
      const contest = await Contest.findById(contestId);
      const isActive = contest ? now >= contest.startTime && now < contest.endTime : false;
      const includesProblem = contest
        ? contest.problemIds.some((id) => id.toString() === problemId)
        : false;

      if (!contest || !isActive || !includesProblem) {
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

  try {
    await submissionQueue.add("executeSubmission", {
      submissionId: submission._id.toString(),
      code,
      language,
      problemId: problemId.toString(),
      queuedAt: Date.now()
    });
  } catch (_err) {
    await Submission.findByIdAndDelete(submission._id);
    const error: CustomError = new Error("Submission queue is unavailable");
    error.statusCode = 503;
    throw error;
  }

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

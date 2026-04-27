import Problem, { IProblem } from "../models/Problem.js";

export const createProblem = async (data: Partial<IProblem>): Promise<IProblem> => {
  return Problem.create(data);
};

export const getProblems = async (): Promise<IProblem[]> => {
  return Problem.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const getAllProblems = async (): Promise<IProblem[]> => {
  return Problem.find().sort({ createdAt: -1 });
};

export const getProblemById = async (id: string): Promise<IProblem | null> => {
  return Problem.findById(id);
};

export const updateProblem = async (id: string, data: Partial<IProblem>): Promise<IProblem | null> => {
  return Problem.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProblem = async (id: string): Promise<IProblem | null> => {
  return Problem.findByIdAndDelete(id);
};

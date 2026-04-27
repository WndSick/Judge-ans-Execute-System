import Contest, { IContest } from "../models/Contest.js";

export const getUpcomingAndActiveContests = async (): Promise<IContest[]> => {
  return Contest.find().sort({ startTime: 1 });
};

export const getContestById = async (id: string): Promise<IContest | null> => {
  return Contest.findById(id);
};

export const getContestByIdWithProblems = async (id: string): Promise<IContest | null> => {
  return Contest.findById(id).populate("problemIds");
};

export const createContest = async (data: Partial<IContest>): Promise<IContest> => {
  return Contest.create(data);
};

export const updateContest = async (id: string, data: Partial<IContest>): Promise<IContest | null> => {
  return Contest.findByIdAndUpdate(id, data, { new: true });
};

export const deleteContest = async (id: string): Promise<IContest | null> => {
  return Contest.findByIdAndDelete(id);
};

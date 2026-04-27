import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId | { _id: string; title: string };
  contestId?: mongoose.Types.ObjectId;
  code: string;
  language: "cpp" | "python";
  status: "pending" | "running" | "completed";
  result: string;
  passedTestCases: number;
  totalTestCases: number;
  error?: string;
  queueTime?: number;
  executionTime?: number;
  totalTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest"
    },
    code: { type: String, required: true },
    language: {
      type: String,
      required: true,
      enum: ["cpp", "python"]
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed"],
      default: "pending"
    },
    result: {
      type: String,
      default: "Pending"
    },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    error: { type: String },
    queueTime: { type: Number },
    executionTime: { type: Number },
    totalTime: { type: Number }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model<ISubmission>("Submission", submissionSchema);

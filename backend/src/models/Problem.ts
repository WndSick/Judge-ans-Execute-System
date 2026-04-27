import mongoose, { Document, Schema } from "mongoose";

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  isPublic: boolean;
  testcases: { input: string; expectedOutput: string }[];
  starterCode?: Record<string, string>;
  constraints?: string[];
  examples?: { input: string; output: string; explanation?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    tags: [{ type: String }],
    timeLimit: { type: Number, required: true, min: 1 }, // in ms
    memoryLimit: { type: Number, required: true, min: 1 }, // in MB
    isPublic: { type: Boolean, default: true },
    testcases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true }
      }
    ],
    starterCode: { type: Map, of: String },
    constraints: [{ type: String }],
    examples: [
      {
        input: { type: String },
        output: { type: String },
        explanation: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IProblem>("Problem", problemSchema);

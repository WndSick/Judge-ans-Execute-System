import mongoose, { Document, Schema } from "mongoose";

export interface IContest extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  problemIds: mongoose.Types.ObjectId[];
}

const contestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    problemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IContest>("Contest", contestSchema);

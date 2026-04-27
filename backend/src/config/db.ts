import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;

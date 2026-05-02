import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import "./src/workers/submissionWorker.js"; // Initialize the submission worker

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server [V2-FIXED] running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

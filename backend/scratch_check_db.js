import mongoose from "mongoose";
import "dotenv/config";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/judge_db");
  const db = mongoose.connection.useDb("judge_db");
  const submissions = await db.collection("submissions").find().sort({_id: -1}).limit(1).toArray();
  console.log(submissions[0]);
  process.exit(0);
}
run();

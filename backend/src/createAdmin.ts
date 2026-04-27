import mongoose from "mongoose";
import User from "./models/User";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/judge_db";

const createAdmin = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const email = "admin@forge.com";
  const password = "adminpassword123";

  // Check if admin exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin user already exists");
  } else {
    await User.create({
      email,
      password,
      role: "admin"
    });
    console.log(`Admin user created: ${email} / ${password}`);
  }

  process.exit(0);
};

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});

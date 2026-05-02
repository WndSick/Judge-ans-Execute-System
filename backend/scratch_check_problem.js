import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './src/models/Problem.js';

dotenv.config();

async function checkProblem() {
  await mongoose.connect(process.env.MONGODB_URI);
  const problem = await Problem.findOne({ title: /Two Sum/i });
  console.log('Problem:', JSON.stringify(problem, null, 2));
  await mongoose.disconnect();
}

checkProblem();

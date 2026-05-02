import { Worker, Job } from "bullmq";
import axios from "axios";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import redisConnection from "../config/redis.js";

const EXECUTOR_URL = process.env.EXECUTOR_URL || "http://localhost:8080/execute";

// Normalize output: replace \r\n with \n, trim trailing spaces per line, trim global
function normalizeOutput(output: string): string {
  if (!output) return "";
  return output
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .trim();
}

console.log("Submission worker started and listening on 'submissionQueue'...");

export const submissionWorker = new Worker(
  "submissionQueue",
  async (job: Job) => {
    // 1. Job Received
    const workerStartTime = Date.now();
    const { submissionId, queuedAt } = job.data;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      console.error(`[Worker] Submission ${submissionId} not found`);
      return;
    }

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      console.error(`[Worker] [Sub:${submissionId}] Problem ${submission.problemId} not found`);
      return;
    }

    // 2. Calculate queueTime & Initial Update
    const queueTime = workerStartTime - (queuedAt || submission.createdAt.getTime());
    submission.queueTime = queueTime;
    submission.status = "running";
    await submission.save();

    console.log(`[Worker] [Sub:${submissionId}] Job started. Queue wait: ${queueTime}ms`);

    let passedTestCases = 0;
    const totalTestCases = problem.testcases.length;
    let totalExecutionTime = 0;
    const loopStartTime = Date.now();
    let finalVerdict = "Accepted";
    let finalError = "";

    try {
      for (let i = 0; i < totalTestCases; i++) {
        // 5. Loop Testcases: Pre-Check Timeout
        if (Date.now() - loopStartTime > 15000) {
          console.warn(`[Worker] [Sub:${submissionId}] Global timeout exceeded (15s)`);
          finalVerdict = "Time Limit Exceeded (Global)";
          break;
        }

        const testcase = problem.testcases[i];
        console.log(`[Worker] [Sub:${submissionId}] [TC:${i + 1}/${totalTestCases}] Sending to executor...`);

        // Execute
        const response = await axios.post(EXECUTOR_URL, {
          code: submission.code,
          language: submission.language,
          input: testcase.input,
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit
        });

        const { status, output, error, runtime, exitCode } = response.data;
        console.log(`[Worker] [Sub:${submissionId}] [TC:${i + 1}] Status: ${status} | Runtime: ${runtime}ms | ExitCode: ${exitCode}`);

        // Accumulate Time
        totalExecutionTime += (runtime ?? 0);

        if (status === "ce") {
          finalVerdict = "Compilation Error";
          finalError = error;
          break;
        }

        if (status === "tle") {
          finalVerdict = "Time Limit Exceeded";
          break;
        }

        if (status === "re" || exitCode !== 0) {
          finalVerdict = "Runtime Error";
          finalError = error;
          break;
        }

        // Judge Output
        const normalizedOutput = normalizeOutput(output);
        const normalizedExpected = normalizeOutput(testcase.expectedOutput);

        if (normalizedOutput !== normalizedExpected) {
          finalVerdict = "Wrong Answer";
          break;
        }

        passedTestCases++;
      }
    } catch (err: any) {
      console.error(`[Worker] [Sub:${submissionId}] [ERROR] Executor failure: ${err.message}`);
      submission.status = "completed";
      submission.result = "Internal Error";
      submission.error = `Executor service is unreachable or failed: ${err.message}`;
      await submission.save();
      return;
    }

    // 6. Finalize
    const workerEndTime = Date.now();
    submission.status = "completed";
    submission.result = finalVerdict;
    submission.passedTestCases = passedTestCases;
    submission.totalTestCases = totalTestCases;
    submission.executionTime = totalExecutionTime;
    submission.totalTime = workerEndTime - submission.createdAt.getTime();
    if (finalError) {
      submission.error = finalError;
    }

    // 7. Save to DB
    await submission.save();
    console.log(`[Worker] [Sub:${submissionId}] Finished. Verdict: ${finalVerdict} | Passed: ${passedTestCases}/${totalTestCases} | Execution: ${totalExecutionTime}ms | Total: ${submission.totalTime}ms`);
  },
  {
    connection: redisConnection,
    concurrency: 4,
    limiter: {
      max: 10,
      duration: 1000
    }
  }
);

submissionWorker.on("failed", async (job: Job | undefined, err: Error) => {
  if (job) {
    const { submissionId } = job.data;
    console.error(`[Worker] [Sub:${submissionId}] [ERROR] Job failed: ${err.message}`);
    
    const submission = await Submission.findById(submissionId);
    if (submission && submission.status !== "completed") {
      submission.status = "completed";
      submission.result = "Internal Error";
      submission.error = `System failure: ${err.message}`;
      await submission.save();
    }
  }
});

import axios from "axios";
import Problem from "../models/Problem.js";

interface CustomError extends Error {
  statusCode?: number;
}

type RunStatus = "success" | "wa" | "tle" | "re" | "ce" | "error";

interface RunPayload {
  problemId: string;
  code: string;
  language: "cpp" | "python";
}

interface RunResultSuccess {
  status: "success";
  passed: number;
  total: number;
  runtime: number;
}

interface RunResultFailure {
  status: Exclude<RunStatus, "success">;
  failedTestCaseIndex?: number;
  input?: string;
  expected?: string;
  actual?: string;
  runtime: number;
}

export type RunResult = RunResultSuccess | RunResultFailure;

const EXECUTOR_URL = process.env.EXECUTOR_URL || "http://localhost:8080/execute";
const EXECUTOR_TIMEOUT_MS = 10000;

const normalizeOutput = (output: string): string => {
  if (!output) return "";
  return output
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
};

const mapExecutorStatus = (status: string): Exclude<RunStatus, "success" | "wa" | "error"> => {
  if (status === "ce") return "ce";
  if (status === "tle") return "tle";
  return "re";
};

export const runSampleTests = async ({ problemId, code, language }: RunPayload): Promise<RunResult> => {
  const problem = await Problem.findById(problemId).select(
    "timeLimit memoryLimit examples testcases"
  );
  if (!problem) {
    const error: CustomError = new Error("Problem not found");
    error.statusCode = 404;
    throw error;
  }

  // Prioritize raw testcases for execution as examples are often formatted for display
  const executableSamples = (problem.testcases ?? [])
    .slice(0, 5) // Run up to 5 samples
    .map((tc: any) => ({
      input: tc.input ?? "",
      output: tc.expectedOutput ?? ""
    }));

  if (executableSamples.length === 0) {
    const error: CustomError = new Error("No sample test cases configured for this problem");
    error.statusCode = 400;
    throw error;
  }

  let totalRuntime = 0;
  for (let i = 0; i < executableSamples.length; i++) {
    const sample = executableSamples[i];
    const expected = normalizeOutput(sample.output ?? "");

    const response = await axios.post(
      EXECUTOR_URL,
      {
        code,
        language,
        input: sample.input ?? "",
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit
      },
      { timeout: EXECUTOR_TIMEOUT_MS }
    );

    const { status, output, runtime } = response.data as {
      status: string;
      output: string;
      runtime?: number;
    };

    totalRuntime += runtime ?? 0;

    if (status !== "success") {
      return {
        status: mapExecutorStatus(status),
        failedTestCaseIndex: i,
        input: sample.input ?? "",
        expected,
        actual: normalizeOutput(output ?? ""),
        runtime: totalRuntime
      };
    }

    const actual = normalizeOutput(output ?? "");
    if (actual !== expected) {
      return {
        status: "wa",
        failedTestCaseIndex: i,
        input: sample.input ?? "",
        expected,
        actual,
        runtime: totalRuntime
      };
    }
  }

  return {
    status: "success",
    passed: executableSamples.length,
    total: executableSamples.length,
    runtime: totalRuntime
  };
};

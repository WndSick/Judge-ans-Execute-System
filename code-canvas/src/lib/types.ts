export type Difficulty = "Easy" | "Medium" | "Hard";

export interface ProblemSummary {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  acceptance?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem extends ProblemSummary {
  statement?: string;
  examples?: Example[];
  constraints?: string[];
  starterCode?: Record<Language, string>;
  sampleInput?: string;
  sampleOutput?: string;
}

export type Language = "javascript" | "typescript" | "python" | "cpp" | "java";

export type SubmissionStatus = "pending" | "running" | "completed";
export type SubmissionResult = "Accepted" | "Wrong Answer" | "TLE" | "Runtime Error" | "Compile Error";

export interface Submission {
  id: string;
  status: SubmissionStatus;
  result?: SubmissionResult;
  passedTestCases: number;
  totalTestCases: number;
  queueTime?: number;     // ms
  executionTime?: number; // ms
  totalTime?: number;     // ms
  message?: string;
  language?: string;
  createdAt?: string;
}

export type RunStatus = "success" | "wa" | "tle" | "re" | "ce" | "error";

export interface RunResult {
  status: RunStatus;
  passed?: number;
  total?: number;
  runtime: number;
  message?: string;
  failedTestCaseIndex?: number;
  input?: string;
  expected?: string;
  actual?: string;
}

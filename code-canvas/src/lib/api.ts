import type { Language, Problem, ProblemSummary, RunResult, Submission } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

const getAuthToken = () => localStorage.getItem("token");

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function mapId<T extends { _id?: string; id?: string }>(item: T): T & { id: string } {
  return { ...item, id: item.id || item._id || "" };
}

/* ---------------- Public API ---------------- */

export async function login(payload: any): Promise<{ token: string; user: { id: string; role: string; email: string } }> {
  const data = await http<{ token: string; user: { id: string; role: string; email: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.user.id);
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("email", data.user.email); // Store email for UI
  return data;
}

export async function register(payload: any): Promise<{ message: string; user: { id: string; role: string } }> {
  return http<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const data = await http<any>("/problems");
  if (!Array.isArray(data)) return [];
  return data.map(mapId);
}

export async function fetchProblem(id: string, contestId?: string): Promise<Problem> {
  const query = contestId ? `?contestId=${contestId}` : "";
  const data = await http<any>(`/problems/${id}${query}`);
  return mapId(data);
}

export async function submitCode(payload: {
  problemId: string;
  language: Language;
  code: string;
  contestId?: string;
}): Promise<{ submissionId: string }> {
  return http<{ submissionId: string }>("/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runCode(payload: {
  problemId: string;
  language: "cpp" | "python";
  code: string;
}): Promise<RunResult> {
  return http<RunResult>(`/problems/${payload.problemId}/run`, {
    method: "POST",
    body: JSON.stringify({
      language: payload.language,
      code: payload.code
    }),
  });
}

export async function fetchSubmission(id: string): Promise<Submission> {
  const data = await http<any>(`/submission/${id}`);
  return mapId(data);
}

export async function fetchMySubmissions(): Promise<Submission[]> {
  const data = await http<any>("/submissions/me");
  if (!Array.isArray(data)) return [];
  return data.map(mapId);
}

export async function fetchContests(): Promise<any[]> {
  const data = await http<any>("/contests");
  if (!Array.isArray(data)) return [];
  return data.map(mapId);
}

export async function fetchContest(id: string): Promise<any> {
  const data = await http<any>(`/contests/${id}`);
  const contest = mapId(data);
  if (contest.problemIds && Array.isArray(contest.problemIds)) {
    contest.problems = contest.problemIds.map((p: any) => (typeof p === 'string' ? { id: p } : mapId(p)));
  } else {
    contest.problems = [];
  }
  return contest;
}

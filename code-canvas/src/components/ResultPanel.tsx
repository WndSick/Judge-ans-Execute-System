import { Check, Clock, Cpu, Loader2, TimerReset, X, Zap, AlertTriangle, Terminal, Activity } from "lucide-react";
import type { RunResult, Submission } from "@/lib/types";

interface Props {
  submission?: Submission;
  runResult?: RunResult;
  isRunning: boolean;
  isSubmitting: boolean;
}

const RESULT_THEME: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  "Accepted":      { label: "Accepted",      color: "text-green-500",  bg: "bg-green-500/5 border-green-500/20", icon: <Check className="h-5 w-5" /> },
  "Wrong Answer":  { label: "Wrong Answer",  color: "text-red-500",    bg: "bg-red-500/5 border-red-500/20",   icon: <X className="h-5 w-5" /> },
  "TLE":           { label: "Time Limit Exceeded", color: "text-yellow-500", bg: "bg-yellow-500/5 border-yellow-500/20", icon: <Clock className="h-5 w-5" /> },
  "Runtime Error": { label: "Runtime Error", color: "text-red-500",    bg: "bg-red-500/5 border-red-500/20",   icon: <AlertTriangle className="h-5 w-5" /> },
  "Compile Error": { label: "Compile Error", color: "text-red-500",    bg: "bg-red-500/5 border-red-500/20",   icon: <AlertTriangle className="h-5 w-5" /> },
  "Internal Error": { label: "Internal Error", color: "text-red-500",   bg: "bg-red-500/5 border-red-500/20",   icon: <AlertTriangle className="h-5 w-5" /> },
};

const RUN_RESULT_THEME: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  success: { label: "Run Passed", color: "text-green-500", bg: "bg-green-500/5 border-green-500/20", icon: <Check className="h-5 w-5" /> },
  wa: { label: "Wrong Answer", color: "text-red-500", bg: "bg-red-500/5 border-red-500/20", icon: <X className="h-5 w-5" /> },
  tle: { label: "Time Limit Exceeded", color: "text-yellow-500", bg: "bg-yellow-500/5 border-yellow-500/20", icon: <Clock className="h-5 w-5" /> },
  re: { label: "Runtime Error", color: "text-red-500", bg: "bg-red-500/5 border-red-500/20", icon: <AlertTriangle className="h-5 w-5" /> },
  ce: { label: "Compile Error", color: "text-red-500", bg: "bg-red-500/5 border-red-500/20", icon: <AlertTriangle className="h-5 w-5" /> },
  error: { label: "Internal Error", color: "text-red-500", bg: "bg-red-500/5 border-red-500/20", icon: <AlertTriangle className="h-5 w-5" /> },
};

export const ResultPanel = ({ submission, runResult, isRunning, isSubmitting }: Props) => {
  if (!submission && !runResult && !isSubmitting && !isRunning) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-muted-foreground/40">
        <Activity className="h-6 w-6 mb-3 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Execute code to see results</p>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="flex h-full flex-col gap-6 px-6 py-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest">Running Sample Tests…</div>
            <span className="text-[10px] text-muted-foreground font-mono">Synchronous execution in progress</span>
          </div>
        </div>
      </div>
    );
  }

  if (runResult) {
    const theme = RUN_RESULT_THEME[runResult.status] || RUN_RESULT_THEME.error;
    return (
      <div className="flex h-full flex-col gap-6 px-6 py-6 animate-fade-in overflow-y-auto">
        <div className={`rounded-xl border p-4 ${theme.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`${theme.color}`}>{theme.icon}</div>
            <div className={`text-lg font-bold uppercase tracking-widest ${theme.color}`}>{theme.label}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric icon={<Cpu className="h-3 w-3" />} label="Runtime" value={fmt(runResult.runtime)} />
          <Metric icon={<Check className="h-3 w-3" />} label="Passed" value={`${runResult.passed ?? 0}`} />
          <Metric icon={<Zap className="h-3 w-3" />} label="Total" value={`${runResult.total ?? 0}`} />
        </div>
        {runResult.failedTestCaseIndex != null && (
          <div className="space-y-3 rounded-xl border border-border/40 bg-secondary/10 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Failed Sample #{runResult.failedTestCaseIndex + 1}
            </div>
            <DiffBlock title="Input" value={runResult.input} />
            <DiffBlock title="Expected" value={runResult.expected} />
            <DiffBlock title="Actual" value={runResult.actual} />
          </div>
        )}
        {runResult.message && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-200">
            {runResult.message}
          </div>
        )}
      </div>
    );
  }

  if (!submission || submission.status !== "completed") {
    const status = submission?.status ?? "pending";
    const passed = (submission as any)?.passedTestCases ?? 0;
    const total = (submission as any)?.totalTestCases ?? 0;

    return (
      <div className="flex h-full flex-col gap-6 px-6 py-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest">
              {status === "pending" ? "Queued in Pool" : "Evaluating Solution"}…
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={`h-full bg-primary transition-all duration-500 ${status === "pending" ? "w-1/4" : "w-2/3 animate-pulse"}`} 
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {status === "pending" ? "Waiting..." : `Running Tests (${passed}/${total})`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 opacity-40">
          <div className="h-14 rounded-xl border border-border/40 bg-secondary/10" />
          <div className="h-14 rounded-xl border border-border/40 bg-secondary/10" />
          <div className="h-14 rounded-xl border border-border/40 bg-secondary/10" />
        </div>
      </div>
    );
  }

  const result = submission.result ?? "Internal Error";
  const theme = RESULT_THEME[result] || RESULT_THEME["Internal Error"];
  const detailedMessage = submission.message || (submission as any).error;

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6 animate-fade-in overflow-y-auto">
      <div className={`rounded-xl border p-4 ${theme.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${theme.color}`}>{theme.icon}</div>
            <div>
              <div className={`text-lg font-bold uppercase tracking-widest ${theme.color}`}>{theme.label}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">EXEC_ID: {submission.id.slice(0, 8)}</div>
            </div>
          </div>
          {submission.result === "Accepted" && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
              <Check className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric icon={<TimerReset className="h-3 w-3" />} label="Queue" value={fmt(submission.queueTime)} />
        <Metric icon={<Cpu className="h-3 w-3" />} label="Runtime"  value={fmt(submission.executionTime)} />
        <Metric icon={<Clock className="h-3 w-3" />} label="Total" value={fmt(submission.totalTime)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Validation Progress</span>
          <span className={theme.color}>{submission.passedTestCases} / {submission.totalTestCases} Tests Passed</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: submission.totalTestCases || 0 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full ${i < (submission.passedTestCases || 0) ? 'bg-green-500' : 'bg-destructive/20'}`} 
            />
          ))}
        </div>

        {detailedMessage && (
          <div className="space-y-2 animate-in fade-in duration-500">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <Terminal className="h-3 w-3" /> Terminal Output
            </div>
            <div className="rounded-xl bg-black/40 border border-border/40 p-4 font-mono text-[11px] leading-relaxed text-blue-100/80 whitespace-pre-wrap overflow-x-auto shadow-inner border-l-2 border-l-primary/40">
              {detailedMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DiffBlock = ({ title, value }: { title: string; value?: string }) => (
  <div>
    <div className="mb-1.5 text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">{title}</div>
    <div className="rounded-lg border border-border/40 bg-black/30 p-3 font-mono text-[11px] whitespace-pre-wrap">
      {value || "—"}
    </div>
  </div>
);

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-border/40 bg-secondary/10 p-2.5 transition-all hover:bg-secondary/20">
    <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
      {icon} {label}
    </div>
    <div className="text-sm font-mono font-bold tracking-tight">{value}</div>
  </div>
);

function fmt(ms?: number) {
  if (ms == null || ms < 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

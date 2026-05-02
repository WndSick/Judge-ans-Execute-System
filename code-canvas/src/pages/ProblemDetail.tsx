import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2, RotateCcw, Send, AlertTriangle, Cpu, Play } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CodeEditor } from "@/components/CodeEditor";
import { ResultPanel } from "@/components/ResultPanel";
import { fetchProblem, fetchSubmission, runCode, submitCode } from "@/lib/api";
import type { Language, RunResult, Submission } from "@/lib/types";
import { toast } from "sonner";

const LANGS: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
];

const POLLING_TIMEOUT_MS = 40000; // 40 seconds

const ProblemDetail = () => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId") || undefined;

  const [problem, setProblem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");

  const [submission, setSubmission] = useState<Submission | undefined>();
  const [runResult, setRunResult] = useState<RunResult | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    let alive = true;
    fetchProblem(id, contestId)
      .then((p) => {
        if (!alive) return;
        setProblem(p);
        setCode(p.starterCode?.[language] ?? "");
        document.title = `${p.title} — Forge`;
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        toast.error("Failed to load problem: " + e.message);
      });
    return () => { alive = false; };
  }, [id, contestId]);

  useEffect(() => {
    if (problem) setCode(problem.starterCode?.[language] ?? "");
  }, [language, problem]);

  useEffect(() => () => { if (pollRef.current) window.clearInterval(pollRef.current); }, []);

  const handleSubmit = async () => {
    if (!problem || isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setSubmission(undefined);
    setRunResult(undefined);
    startTimeRef.current = Date.now();
    
    try {
      const { submissionId } = await submitCode({ 
        problemId: problem.id, 
        language, 
        code,
        contestId
      });

      const tick = async () => {
        const elapsed = Date.now() - startTimeRef.current;
        
        if (elapsed > POLLING_TIMEOUT_MS) {
          stopPolling();
          setSubmission({
            id: submissionId,
            status: "completed",
            result: "Internal Error",
            message: "Execution timeout. The system took too long to respond. Please try again.",
            passedTestCases: 0,
            totalTestCases: 0
          } as any);
          toast.error("Execution timeout");
          return;
        }

        try {
          const s = await fetchSubmission(submissionId);
          setSubmission(s);
          if (s.status === "completed") {
            stopPolling();
          }
        } catch (err: any) {
          stopPolling();
          toast.error("Failed to sync status");
        }
      };

      const stopPolling = () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = null;
        setIsSubmitting(false);
      };

      tick();
      pollRef.current = window.setInterval(tick, 1500);
    } catch (e: any) {
      setIsSubmitting(false);
      toast.error("Submission failed: " + e.message);
    }
  };

  const handleRun = async () => {
    if (!problem || isSubmitting || isRunning) return;
    setIsRunning(true);
    setSubmission(undefined);
    setRunResult(undefined);

    try {
      const result = await runCode({
        problemId: problem.id,
        language: language as "cpp" | "python",
        code
      });
      setRunResult(result);
      if (result.status === "success") {
        toast.success("All sample tests passed");
      } else {
        toast.error(`Run finished with status: ${result.status}`);
      }
    } catch (e: any) {
      toast.error("Run failed: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (problem) setCode(problem.starterCode?.[language] ?? "");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto mt-24 max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-base font-bold text-destructive uppercase tracking-widest">Problem Unavailable</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link to="/" className="mt-6 inline-flex text-xs font-bold uppercase tracking-widest text-primary hover:underline">← Back to problems</Link>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto mt-32 flex max-w-md flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Initializing Environment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav />

      <div className="flex items-center justify-between border-b border-border/40 bg-background/95 px-6 py-2 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 text-muted-foreground transition-all hover:text-foreground hover:border-primary/40">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-sm font-bold tracking-tight">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/10 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-foreground hover:bg-secondary/30"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isSubmitting || isRunning}
            className="flex h-8 items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {isRunning ? "Running" : "Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="flex h-8 items-center gap-2 rounded-lg bg-primary px-4 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            {isSubmitting ? "Judging" : "Submit"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
        <section className="min-h-0 overflow-y-auto border-b border-border/40 lg:border-b-0 lg:border-r bg-secondary/5">
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 text-primary/60 mb-2">
              <Cpu className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Problem Specification</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-6">{problem.title}</h2>
            
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap text-[13px]">
              {problem.description}
            </div>

            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-10 space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Test Cases & Examples</h3>
                {problem.examples.map((ex: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card/30 p-5 font-mono text-[12px]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Case #{i + 1}</span>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <div className="text-[9px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest font-bold">Input</div>
                        <div className="bg-black/20 px-4 py-3 rounded-lg border border-border/40 text-foreground/90 whitespace-pre-wrap">{ex.input}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest font-bold">Expected Output</div>
                        <div className="bg-black/20 px-4 py-3 rounded-lg border border-border/40 text-primary/80 font-bold whitespace-pre-wrap">{ex.output}</div>
                      </div>
                      {ex.explanation && (
                        <div className="pt-2">
                          <div className="text-[9px] text-muted-foreground/50 mb-1 uppercase tracking-widest font-bold">Notes</div>
                          <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {problem.constraints && problem.constraints.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border/40">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Boundary Conditions</h3>
                <ul className="space-y-2">
                  {problem.constraints.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] text-muted-foreground/80">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-secondary/5">
            <LanguageSelect value={language} onChange={setLanguage} />
          </div>

          <div className="min-h-0 flex-1 p-4 bg-background">
            <div className="h-full rounded-xl border border-border/40 overflow-hidden shadow-inner">
              <CodeEditor value={code} onChange={setCode} language={language} />
            </div>
          </div>

          <div className="h-[35%] min-h-[260px] border-t border-border/40 bg-secondary/5">
            <ResultPanel
              submission={submission}
              runResult={runResult}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const LanguageSelect = ({ value, onChange }: { value: Language; onChange: (v: Language) => void }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Language)}
      className="appearance-none rounded-lg border border-border/60 bg-background/50 py-1.5 pl-4 pr-10 text-[10px] font-bold uppercase tracking-widest outline-none transition-all hover:border-primary/40 focus:ring-1 focus:ring-primary/20 cursor-pointer"
    >
      {LANGS.map((l) => (
        <option key={l.value} value={l.value} className="bg-background">{l.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
  </div>
);

export default ProblemDetail;

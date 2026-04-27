import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { fetchMySubmissions } from "@/lib/api";
import { Clock, Code2, Trophy, BookOpen, ChevronRight, CheckCircle2, XCircle, AlertCircle, History } from "lucide-react";
import { toast } from "sonner";

const Submissions = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Forge — Activity History";
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMySubmissions();
      setSubmissions(data);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to sync submissions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (result: string) => {
    if (result === "Accepted") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (result === "Pending" || result === "Running") return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 flex items-end justify-between border-b border-border/40 pb-8">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-sm text-muted-foreground">Detailed history of your code submissions and performance.</p>
          </div>
          <button 
            onClick={loadSubmissions}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all px-3 py-2 rounded-lg bg-primary/5 border border-primary/20"
          >
            <History className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 rounded-2xl border border-border/60 bg-secondary/10 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-destructive/20 bg-destructive/5 text-center px-6">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <p className="text-sm font-bold text-destructive">Synchronization Error</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
            <button onClick={loadSubmissions} className="mt-6 px-5 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-widest">Try Again</button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-border/60 bg-secondary/5 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Submit a solution to start tracking your performance.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div 
                key={s.id} 
                className="group relative rounded-xl border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-secondary/20 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {s.contestId ? <Trophy className="h-5 w-5" /> : <Code2 className="h-5 w-5" />}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold tracking-tight text-foreground">
                          {s.problemId?.title || "Solution Attempt"}
                        </h3>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                          s.contestId ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/40"
                        }`}>
                          {s.contestId ? "Contest" : "Practice"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        <span className="flex items-center gap-1">{s.language}</span>
                        <span>•</span>
                        <span>{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-sm font-bold tracking-tight ${
                          s.result === 'Accepted' ? 'text-green-500' : 
                          s.result === 'Pending' || s.result === 'Running' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {s.result}
                        </span>
                        {getStatusIcon(s.result)}
                      </div>
                      {(s.executionTime !== undefined || s.memoryUsed !== undefined) && (
                        <p className="text-[9px] font-mono text-muted-foreground/60 mt-1 uppercase">
                          {s.executionTime}ms / {s.memoryUsed || 0}KB
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/60 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Submissions;

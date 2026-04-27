import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { fetchContest } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Lock, Trophy, Timer, AlertCircle } from "lucide-react";
import { ProblemCard } from "@/components/ProblemCard";
import { format, isAfter, isBefore, differenceInSeconds } from "date-fns";
import { toast } from "sonner";

const ContestDetail = () => {
  const { id = "" } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchContest(id)
      .then(setContest)
      .catch((e) => {
        setError(e.message);
        toast.error("Failed to load contest: " + e.message);
      })
      .finally(() => setLoading(false));

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen">
      <TopNav />
      <div className="flex flex-col items-center justify-center pt-32 text-muted-foreground animate-pulse">
        <Clock className="h-8 w-8 mb-4 animate-spin" />
        <p className="text-sm font-medium">Synchronizing contest details...</p>
      </div>
    </div>
  );

  if (error || !contest) return (
    <div className="min-h-screen">
      <TopNav />
      <div className="mx-auto mt-24 max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="font-display text-base font-semibold text-destructive">Something went wrong</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error || "Contest not found"}</p>
        <Link to="/contests" className="mt-4 inline-flex text-sm text-primary hover:underline">← Back to contests</Link>
      </div>
    </div>
  );

  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const isUpcoming = isBefore(now, startTime);
  const isActive = isAfter(now, startTime) && isBefore(now, endTime);
  const hasEnded = isAfter(now, endTime);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const countdownText = isUpcoming 
    ? formatCountdown(differenceInSeconds(startTime, now))
    : isActive 
      ? formatCountdown(differenceInSeconds(endTime, now))
      : "Contest ended";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-[1400px] px-6 py-12">
        <Link to="/contests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to all contests
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="animate-in slide-in-from-left-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono tracking-widest text-[10px] uppercase">Official Contest</Badge>
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">{contest.title}</h1>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(startTime, "PPP p")} — {format(endTime, "p")}</span>
              </div>
            </div>
          </div>

          <Card className="bg-card/40 border-border/60 p-6 min-w-[280px] shadow-xl backdrop-blur-sm animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Time Remaining</div>
              <Timer className={`h-4 w-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
            </div>
            <div className={`text-3xl font-display font-bold tracking-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {countdownText}
            </div>
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : isUpcoming ? 'bg-blue-500' : 'bg-muted-foreground/30'}`} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isActive ? "Status: Live Now" : isUpcoming ? "Status: Upcoming" : "Status: Finished"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-display text-2xl font-semibold">Problem Set</h2>
            <div className="text-xs text-muted-foreground font-medium">
              {contest.problems?.length || 0} Problems in this contest
            </div>
          </div>
          
          {isUpcoming ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/5 p-20 text-center backdrop-blur-sm">
              <Lock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold">Problems are currently locked</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">The problem set will be revealed automatically when the countdown hits zero.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contest.problems?.map((p: any, i: number) => (
                <ProblemCard key={p.id} problem={p} index={i} contestId={contest.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContestDetail;

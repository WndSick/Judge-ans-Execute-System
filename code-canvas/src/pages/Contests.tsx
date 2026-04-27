import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { fetchContests } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Timer, Inbox } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

const Contests = () => {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    document.title = "Forge — Contests";
    fetchContests()
      .then(setContests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatus = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) {
      const diff = differenceInSeconds(startTime, now);
      return { 
        label: "Upcoming", 
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        countdown: formatCountdown(diff)
      };
    }
    if (now < endTime) {
      const diff = differenceInSeconds(endTime, now);
      return { 
        label: "Active", 
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        countdown: formatCountdown(diff)
      };
    }
    return { 
      label: "Ended", 
      color: "bg-muted text-muted-foreground border-border/40",
      countdown: null 
    };
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex items-center justify-between mb-12 border-b border-border/40 pb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Global Contests</h1>
            <p className="mt-2 text-muted-foreground text-sm">Compete in scheduled challenges and climb the leaderboard.</p>
          </div>
          <Trophy className="h-10 w-10 text-primary/20" />
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl border border-border/60 bg-secondary/10 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 font-bold text-sm uppercase tracking-widest">
            Sync Error: {error}
          </div>
        ) : contests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-border/60 bg-secondary/5 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No contests available</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Check back later for new scheduled events.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => {
              const status = getStatus(contest.startTime, contest.endTime);
              return (
                <Link key={contest.id} to={`/contests/${contest.id}`} className="block">
                  <Card className="h-full border-border/60 bg-card/40 transition-all hover:border-primary/40 hover:bg-secondary/10 group flex flex-col shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`font-mono text-[9px] font-bold uppercase tracking-widest ${status.color}`}>
                          {status.label}
                        </Badge>
                        {status.countdown && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-muted-foreground/80">
                            <Timer className="h-3 w-3" /> {status.countdown}
                          </div>
                        )}
                      </div>
                      <CardTitle className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                        {contest.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2 text-[11px] font-medium uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(contest.startTime), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 bg-secondary/30 p-3 rounded-lg border border-border/40 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(new Date(contest.startTime), "p")}</span>
                        </div>
                        <span className="opacity-40">—</span>
                        <div className="flex items-center gap-2">
                          <span>{format(new Date(contest.endTime), "p")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Contests;

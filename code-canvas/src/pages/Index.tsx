import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Trophy, Inbox } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { ProblemCard } from "@/components/ProblemCard";
import { fetchProblems } from "@/lib/api";
import type { Difficulty, ProblemSummary } from "@/lib/types";
import { Link } from "react-router-dom";

const FILTERS: ("All" | Difficulty)[] = ["All", "Easy", "Medium", "Hard"];

const Index = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    document.title = "Forge — Problems";
    fetchProblems()
      .then(setProblems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (filter !== "All" && p.difficulty !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q));
    });
  }, [problems, query, filter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <section className="border-b border-border/40 bg-secondary/5">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
                Master the Algorithm.
              </h1>
              <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
                Forge Engine is a high-performance practice environment for software engineers to solve complex problems and benchmark their solutions in real-time.
              </p>
            </div>
            <Link to="/contests" className="group">
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:bg-secondary/30 hover:border-primary/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Competitions</div>
                  <div className="text-sm font-bold">Active Contests</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or tags..."
                className="h-10 w-full rounded-lg border border-border/60 bg-background/50 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary/60"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/20 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filter === f
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-6 py-12">
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 font-medium">
            Error loading problems: {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-border/60 bg-secondary/5">
            <Inbox className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No problems found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProblemCard key={p.id} problem={p} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-44 rounded-2xl border border-border/60 bg-secondary/10 animate-pulse" />
    ))}
  </div>
);

export default Index;

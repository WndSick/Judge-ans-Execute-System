import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import type { ProblemSummary } from "@/lib/types";

export const ProblemCard = ({ problem, index, contestId }: { problem: ProblemSummary; index: number; contestId?: string }) => {
  if (!problem) return null;
  const link = contestId ? `/problems/${problem.id}?contestId=${contestId}` : `/problems/${problem.id}`;
  
  return (
    <Link
      to={link}
      className="group relative block overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-all hover:border-primary/40 hover:bg-secondary/10 shadow-sm"
      style={{ animation: `slide-up 0.4s ease-out both`, animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-muted-foreground/60 tracking-widest">#{String(index + 1).padStart(3, "0")}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
        {problem.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
        {problem.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {problem.tags?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-secondary/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border/40">
              {t}
            </span>
          ))}
        </div>
        {problem.acceptance != null && (
          <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">{problem.acceptance}% SOLVED</span>
        )}
      </div>
    </Link>
  );
};

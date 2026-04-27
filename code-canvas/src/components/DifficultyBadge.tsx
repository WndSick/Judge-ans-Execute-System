import type { Difficulty } from "@/lib/types";

const STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  Easy:   { dot: "bg-green-500",   text: "text-green-500",   bg: "bg-green-500/10 border-green-500/20" },
  Medium: { dot: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  Hard:   { dot: "bg-red-500",   text: "text-red-500",   bg: "bg-red-500/10 border-red-500/20" },
};

export const DifficultyBadge = ({ difficulty, size = "sm" }: { difficulty?: Difficulty; size?: "sm" | "md" }) => {
  const s = STYLES[difficulty || "Easy"] || STYLES.Easy;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.bg} ${s.text} font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {difficulty || "Easy"}
    </span>
  );
};

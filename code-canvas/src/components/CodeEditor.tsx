import { useMemo } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
}

/**
 * Lightweight code editor: textarea with synchronized line numbers.
 * Monospace, dark theme, no external deps.
 */
export const CodeEditor = ({ value, onChange, language }: Props) => {
  const lines = useMemo(() => value.split("\n").length, [value]);

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-[hsl(222_30%_4%)]">
      {/* gutter */}
      <div className="absolute inset-y-0 left-0 w-12 select-none border-r border-border/50 bg-[hsl(222_30%_3.5%)] py-4 text-right">
        <div className="px-2 font-mono text-[12px] leading-6 text-muted-foreground/60">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>

      <textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full resize-none bg-transparent py-4 pl-14 pr-4 font-mono text-[13.5px] leading-6 text-foreground/95 outline-none placeholder:text-muted-foreground/50"
        placeholder={`// Write your ${language} solution...`}
      />

      {/* subtle gradient frame */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.02]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-60" />
    </div>
  );
};

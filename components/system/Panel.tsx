import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  /** "glow" voor het belangrijkste venster, "warn" voor waarschuwingen. */
  tone?: "default" | "glow" | "warn";
  /** Toon de vier gloeiende hoekjes, zoals bij het spelersvenster. */
  corners?: boolean;
  className?: string;
};

const toneClasses = {
  default: "border-line bg-panel",
  glow: "border-glow bg-panel shadow-glow",
  warn: "border-warn bg-warn-panel",
};

export function Panel({ children, tone = "default", corners = false, className = "" }: PanelProps) {
  return (
    <section className={`relative rounded-md border ${toneClasses[tone]} ${className}`}>
      {corners && <Corners />}
      {children}
    </section>
  );
}

function Corners() {
  const base = "pointer-events-none absolute size-4 border-glow";
  return (
    <>
      <span aria-hidden className={`${base} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden className={`${base} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden className={`${base} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden className={`${base} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}

/** Het kleine label in hoofdletters, zoals "MAANDQUEST · OKTOBER". */
export function Label({ children, className = "text-muted" }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] font-bold tracking-[0.14em] ${className}`}>{children}</span>;
}

/** Een balk die uit losse blokjes bestaat, één per dienst. */
export function SegmentBar({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div role="img" aria-label={label} className="flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-2.5 flex-1 ${i < done ? "bg-glow" : "bg-track"}`} />
      ))}
    </div>
  );
}

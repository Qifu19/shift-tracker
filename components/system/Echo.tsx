import type { EchoMood } from "@/lib/game";

// ECHO, je gids. Getekend met simpele SVG-vormen, zodat de kleur en het
// "oog" per stemming kunnen veranderen zonder losse afbeeldingen.

const moodColor: Record<EchoMood, string> = {
  neutraal: "var(--color-glow)",
  blij: "var(--color-glow)",
  waarschuwing: "var(--color-warn)",
  trots: "var(--color-gold)",
};

export function Echo({ mood = "neutraal", size = 52 }: { mood?: EchoMood; size?: number }) {
  const color = moodColor[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className="shrink-0"
      style={{ filter: `drop-shadow(0 0 8px color-mix(in srgb, ${color} 50%, transparent))` }}
    >
      <path d="M6 30 L12 25 L12 39 Z" fill={color} opacity="0.6" />
      <path d="M58 30 L52 25 L52 39 Z" fill={color} opacity="0.6" />
      <path d="M32 8 L52 20 L52 44 L32 56 L12 44 L12 20 Z" fill="var(--color-panel)" stroke={color} strokeWidth="2" />
      {mood === "neutraal" && <rect x="22" y="30" width="20" height="4" rx="2" fill={color} />}
      {(mood === "blij" || mood === "trots") && (
        <path d="M24 34 Q32 25 40 34" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      )}
      {mood === "waarschuwing" && <path d="M22 28 L42 33" stroke={color} strokeWidth="3.5" strokeLinecap="round" />}
      {mood === "trots" && (
        <>
          <path d="M55 6 V14 M51 10 H59" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 50 V56 M5 53 H11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** ECHO met een tekstballon ernaast. */
export function EchoMessage({ mood = "neutraal", children }: { mood?: EchoMood; children: React.ReactNode }) {
  const warn = mood === "waarschuwing";

  return (
    <section aria-label="Bericht van ECHO" className="flex items-start gap-2.5">
      <Echo mood={mood} />
      <div
        role={warn ? "alert" : "status"}
        className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2.5 ${
          warn ? "border-warn bg-warn-panel" : "border-glow bg-panel shadow-glow"
        }`}
      >
        <span className={`font-mono text-[10px] font-bold tracking-[0.18em] ${warn ? "text-warn" : "text-glow"}`}>
          {warn ? "[ ECHO · LET OP ]" : "[ ECHO ]"}
        </span>
        <p className="text-sm leading-snug">{children}</p>
      </div>
    </section>
  );
}

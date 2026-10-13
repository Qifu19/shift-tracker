import type { Rank } from "@/lib/game";

// De avatar van de speler. Hoe hoger de rang, hoe meer details:
// E is een kale omtrek, D krijgt een vizier, C een aura en embleem,
// B een gouden embleem, S schouderstukken en een dubbele aura.

export function Avatar({ rank, size = 104 }: { rank: Rank; size?: number }) {
  const level = { E: 0, D: 1, C: 2, B: 3, S: 4 }[rank];
  const line = level === 0 ? "#5b7a99" : "var(--color-glow)";
  const accent = level >= 3 ? "var(--color-gold)" : "var(--color-glow)";

  return (
    <svg
      width={size}
      height={(size * 140) / 120}
      viewBox="0 0 120 140"
      fill="none"
      role="img"
      aria-label={`Avatar, rang ${rank}`}
      className="shrink-0"
      style={level >= 2 ? { filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accent} 40%, transparent))` } : undefined}
    >
      {level === 1 && (
        <circle cx="60" cy="66" r="50" stroke={line} strokeWidth="1" strokeDasharray="3 6" opacity="0.35" />
      )}
      {level >= 2 && <circle cx="60" cy="66" r="53" stroke={accent} strokeWidth="1.5" opacity="0.55" />}
      {level === 4 && (
        <circle cx="60" cy="66" r="45" stroke={accent} strokeWidth="1" strokeDasharray="2 5" opacity="0.6" />
      )}

      <path d="M22 132 C22 98 40 82 60 82 C80 82 98 98 98 132" fill="var(--color-panel)" stroke={line} strokeWidth="2" />

      {level === 4 && (
        <>
          <path d="M28 100 L44 86 L48 95 Z" fill={accent} />
          <path d="M92 100 L76 86 L72 95 Z" fill={accent} />
        </>
      )}
      {level >= 1 && <path d="M60 90 V124" stroke={level >= 3 ? accent : line} strokeWidth="1" opacity="0.6" />}
      {level >= 2 && <path d="M60 100 L66 106 L60 112 L54 106 Z" fill={accent} />}

      <circle cx="60" cy="50" r="19" fill="var(--color-panel)" stroke={line} strokeWidth="2" />
      {level >= 1 && <rect x="45" y="46" width="30" height="6" rx="3" fill={level === 4 ? accent : line} />}
    </svg>
  );
}

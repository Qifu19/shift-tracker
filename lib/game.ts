import { addDays, formatLocal, isNightShift, localDate, type PaySettings, type ShiftTimes } from "./shifts";

// De spelregels. Ook hier alleen pure functies: gewerkte uren erin,
// level, rang en titel eruit.

export const HOURS_PER_LEVEL = 40;

export type Rank = "E" | "D" | "C" | "B" | "S";
export type EchoMood = "neutraal" | "blij" | "waarschuwing" | "trots";

/** Elke 40 gewerkte uren een level hoger. Je begint op level 1. */
export function levelFromHours(totalHours: number) {
  const level = Math.floor(totalHours / HOURS_PER_LEVEL) + 1;
  const exp = Math.floor(totalHours % HOURS_PER_LEVEL);
  return { level, exp, expNeeded: HOURS_PER_LEVEL };
}

export function rankForLevel(level: number): Rank {
  if (level >= 30) return "S";
  if (level >= 20) return "B";
  if (level >= 10) return "C";
  if (level >= 5) return "D";
  return "E";
}

/** Een titel als beloning voor een mijlpaal. */
export function titleFor(workedShifts: ShiftTimes[], settings: PaySettings) {
  const nights = workedShifts.filter((shift) => isNightShift(shift, settings)).length;
  if (nights >= 10) return "Nachtwacht";
  if (nights >= 3) return "Nachtuil";
  if (workedShifts.length >= 1) return "Rekruut";
  return "Nieuwkomer";
}

/** Wat ECHO zegt op het Status-scherm. */
export function echoMessage(
  nextShift: ShiftTimes | undefined,
  now: Date,
  settings: PaySettings,
): { mood: EchoMood; text: string } {
  if (!nextShift) {
    return { mood: "neutraal", text: "Geen open quests. Voeg je rooster toe met de knop +." };
  }

  const today = localDate(now);
  const shiftDay = localDate(nextShift.startTime);
  const time = formatLocal(nextShift.startTime, "HH:mm");

  if (shiftDay === today) {
    return { mood: "waarschuwing", text: `Je quest start vandaag om ${time}. Succes, speler.` };
  }
  if (shiftDay === addDays(today, 1)) {
    return isNightShift(nextShift, settings)
      ? { mood: "waarschuwing", text: `Morgen een nachtquest om ${time}. Slaap vandaag goed.` }
      : { mood: "neutraal", text: `Je volgende quest start morgen om ${time}.` };
  }

  const days = Math.round(
    (new Date(`${shiftDay}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000,
  );
  return { mood: "neutraal", text: `Welkom terug, speler. Je volgende quest start over ${days} dagen.` };
}

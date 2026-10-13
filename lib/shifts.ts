import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { nl } from "date-fns/locale";

// Pure rekenfuncties voor diensten. Geen database, geen React:
// daardoor kun je ze zowel op de server als in de browser gebruiken,
// en zijn ze makkelijk te testen.

export const TIME_ZONE = "Europe/Amsterdam";

// Voorlopig vaste instellingen. Later komen deze uit de database,
// zodat je ze op het Systeem-scherm kunt aanpassen.
export const PAY_SETTINGS = {
  hourlyWage: 15,
  nightBonus: 0.3, // +30%
  nightStartHour: 22,
  nightEndHour: 6,
};

export type PaySettings = typeof PAY_SETTINGS;

export type ShiftTimes = {
  startTime: Date;
  endTime: Date;
  breakMinutes: number;
};

const MINUTE = 60_000;

/** Tel een aantal kalenderdagen op bij een datum als "2026-10-13". */
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** De lokale datum (Amsterdam) van een moment, als "2026-10-13". */
export function localDate(moment: Date) {
  return formatInTimeZone(moment, TIME_ZONE, "yyyy-MM-dd");
}

export function formatLocal(moment: Date, pattern: string) {
  return formatInTimeZone(moment, TIME_ZONE, pattern, { locale: nl });
}

/**
 * Zet een datum en twee tijden om naar echte momenten.
 * Eindtijd vóór (of gelijk aan) de begintijd? Dan loopt de dienst over
 * middernacht en eindigt hij de volgende dag.
 */
export function toShiftMoments(date: string, start: string, end: string) {
  const startTime = fromZonedTime(`${date}T${start}`, TIME_ZONE);
  let endTime = fromZonedTime(`${date}T${end}`, TIME_ZONE);
  const overnight = endTime <= startTime;
  if (overnight) {
    endTime = fromZonedTime(`${addDays(date, 1)}T${end}`, TIME_ZONE);
  }
  return { startTime, endTime, overnight };
}

/** Begin en einde van de kalendermaand (Amsterdamse tijd) waarin `moment` valt. */
export function monthRange(moment: Date) {
  const month = formatInTimeZone(moment, TIME_ZONE, "yyyy-MM");
  const [year, m] = month.split("-").map(Number);
  const next = m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, "0")}`;
  return {
    start: fromZonedTime(`${month}-01T00:00`, TIME_ZONE),
    end: fromZonedTime(`${next}-01T00:00`, TIME_ZONE),
  };
}

/** Gewerkte minuten: de duur min de pauze. */
export function workedMinutes(shift: ShiftTimes) {
  const total = (shift.endTime.getTime() - shift.startTime.getTime()) / MINUTE;
  return Math.max(0, total - shift.breakMinutes);
}

/**
 * Minuten binnen het nachtvenster (standaard 22:00–06:00, Amsterdamse tijd).
 *
 * Werkt per kalendernacht: voor elke nacht die de dienst kan raken, maken we
 * het venster als echte momenten aan en tellen we de overlap. Omdat
 * fromZonedTime de tijdzone kent, klopt dit ook in de nachten dat de klok
 * verzet wordt.
 *
 * Aanname: de pauze valt in de nacht, dus die gaat van de nachtminuten af.
 */
export function nightMinutes(shift: ShiftTimes, settings: PaySettings = PAY_SETTINGS) {
  const start = shift.startTime.getTime();
  const end = shift.endTime.getTime();
  const pad = (n: number) => String(n).padStart(2, "0");

  let overlap = 0;
  const firstDay = addDays(localDate(shift.startTime), -1);
  const lastDay = localDate(shift.endTime);

  for (let day = firstDay; day <= lastDay; day = addDays(day, 1)) {
    const windowStart = fromZonedTime(`${day}T${pad(settings.nightStartHour)}:00`, TIME_ZONE).getTime();
    const windowEnd = fromZonedTime(`${addDays(day, 1)}T${pad(settings.nightEndHour)}:00`, TIME_ZONE).getTime();
    overlap += Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));
  }

  const minutes = overlap / MINUTE;
  return Math.max(0, Math.min(minutes - shift.breakMinutes, workedMinutes(shift)));
}

export type ShiftPay = {
  workedHours: number;
  nightHours: number;
  base: number;
  bonus: number;
  total: number;
};

/** Brutoloon van één dienst, opgesplitst in basis en nachttoeslag. */
export function shiftPay(shift: ShiftTimes, settings: PaySettings = PAY_SETTINGS): ShiftPay {
  const workedHours = workedMinutes(shift) / 60;
  const nightHours = nightMinutes(shift, settings) / 60;
  const base = round2(workedHours * settings.hourlyWage);
  const bonus = round2(nightHours * settings.hourlyWage * settings.nightBonus);
  return { workedHours, nightHours, base, bonus, total: round2(base + bonus) };
}

/** Een dienst telt als nachtdienst als minstens de helft in de nacht valt. */
export function isNightShift(shift: ShiftTimes) {
  const worked = workedMinutes(shift);
  return worked > 0 && nightMinutes(shift) >= worked / 2;
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

const euroFormat = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const hoursFormat = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatEuro = (value: number) => euroFormat.format(value);
export const formatHours = (value: number) => hoursFormat.format(value);

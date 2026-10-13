import { describe, expect, it } from "vitest";
import { levelFromHours, rankForLevel } from "./game";
import { nightMinutes, shiftPay, toShiftMoments, workedMinutes } from "./shifts";

function shift(date: string, start: string, end: string, breakMinutes = 0) {
  return { ...toShiftMoments(date, start, end), breakMinutes };
}

describe("toShiftMoments", () => {
  it("zet de eindtijd op de volgende dag als de dienst over middernacht loopt", () => {
    const s = shift("2026-10-13", "22:00", "06:30");
    expect(s.overnight).toBe(true);
    expect(s.startTime.toISOString()).toBe("2026-10-13T20:00:00.000Z");
    expect(s.endTime.toISOString()).toBe("2026-10-14T04:30:00.000Z");
  });

  it("houdt een dagdienst op dezelfde dag", () => {
    const s = shift("2026-10-09", "06:00", "14:30");
    expect(s.overnight).toBe(false);
  });
});

describe("workedMinutes en nightMinutes", () => {
  it("rekent een nachtdienst met pauze goed uit", () => {
    const s = shift("2026-10-13", "22:00", "06:30", 30);
    expect(workedMinutes(s)).toBe(480); // 8,0 uur
    expect(nightMinutes(s)).toBe(450); // 7,5 uur
  });

  it("telt een ochtenddienst vanaf 06:00 niet als nacht", () => {
    expect(nightMinutes(shift("2026-10-09", "06:00", "14:30", 30))).toBe(0);
  });

  it("telt een vroege dienst vóór 06:00 deels als nacht", () => {
    expect(nightMinutes(shift("2026-10-09", "04:00", "12:00"))).toBe(120);
  });

  it("klopt in de nacht dat de wintertijd ingaat (klok een uur terug)", () => {
    // 24 op 25 oktober 2026: om 03:00 gaat de klok terug naar 02:00.
    const s = shift("2026-10-24", "22:00", "06:00");
    expect(workedMinutes(s)).toBe(9 * 60);
    expect(nightMinutes(s)).toBe(9 * 60);
  });

  it("klopt in de nacht dat de zomertijd ingaat (klok een uur vooruit)", () => {
    // 28 op 29 maart 2026: om 02:00 springt de klok naar 03:00.
    const s = shift("2026-03-28", "22:00", "06:00");
    expect(workedMinutes(s)).toBe(7 * 60);
    expect(nightMinutes(s)).toBe(7 * 60);
  });
});

describe("shiftPay", () => {
  it("splitst het loon in basis en nachttoeslag", () => {
    const pay = shiftPay(shift("2026-10-13", "22:00", "06:30", 30));
    expect(pay.base).toBe(120);
    expect(pay.bonus).toBe(33.75);
    expect(pay.total).toBe(153.75);
  });
});

describe("spelregels", () => {
  it("geeft elke 40 uur een level", () => {
    expect(levelFromHours(0)).toEqual({ level: 1, exp: 0, expNeeded: 40 });
    expect(levelFromHours(272)).toEqual({ level: 7, exp: 32, expNeeded: 40 });
  });

  it("koppelt levels aan rangen", () => {
    expect(rankForLevel(1)).toBe("E");
    expect(rankForLevel(7)).toBe("D");
    expect(rankForLevel(12)).toBe("C");
    expect(rankForLevel(30)).toBe("S");
  });
});

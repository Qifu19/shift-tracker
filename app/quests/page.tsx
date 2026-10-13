import { prisma } from "@/lib/prisma";
import type { Shift } from "@/generated/prisma/client";
import { addDays, formatEuro, formatLocal, isNightShift, localDate, monthRange, shiftPay } from "@/lib/shifts";
import { EchoMessage } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";
import { Screen } from "@/components/system/Screen";
import { completeQuest } from "./actions";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const now = new Date();
  const { start, end } = monthRange(now);

  const shifts = await prisma.shift.findMany({
    where: { startTime: { gte: start, lt: end } },
    orderBy: { startTime: "asc" },
  });

  const weeks = groupByWeek(shifts);
  const overdue = shifts.filter((s) => s.status === "PLANNED" && s.endTime < now).length;

  return (
    <Screen>
      <header className="flex flex-col gap-1">
        <Label className="text-glow">[ QUESTLOG · {formatLocal(now, "MMMM yyyy").toUpperCase()} ]</Label>
        <h1 className="text-[28px] font-bold">Quests</h1>
      </header>

      {overdue > 0 && (
        <EchoMessage mood="waarschuwing">
          {overdue === 1
            ? "Er staat nog 1 quest open die al voorbij is. Heb je hem gewerkt? Zet hem dan op voltooid."
            : `Er staan nog ${overdue} quests open die al voorbij zijn. Heb je ze gewerkt? Zet ze dan op voltooid.`}
        </EchoMessage>
      )}

      {shifts.length === 0 && (
        <EchoMessage>Je questlog is leeg. Voeg je eerste quest toe met de knop +.</EchoMessage>
      )}

      {weeks.map((week) => (
        <section key={week.key} className="flex flex-col gap-2">
          <h2 className="flex justify-between px-0.5 pt-1 font-mono text-[11px] font-bold tracking-[0.12em] text-muted">
            <span>{week.label}</span>
            <span>
              {week.shifts.filter((s) => s.status === "WORKED").length} / {week.shifts.length} VOLTOOID
            </span>
          </h2>
          {week.shifts.map((shift) => (
            <QuestCard key={shift.id} shift={shift} now={now} />
          ))}
        </section>
      ))}
    </Screen>
  );
}

function QuestCard({ shift, now }: { shift: Shift; now: Date }) {
  const pay = shiftPay(shift);
  const done = shift.status === "WORKED";
  const overnight = localDate(shift.endTime) !== localDate(shift.startTime);
  const kind = isNightShift(shift) ? "NACHTDIENST" : "DIENST";
  // Alleen quests die al begonnen zijn kun je voltooien.
  const canComplete = !done && shift.startTime <= now;

  return (
    <Panel tone={canComplete ? "glow" : "default"} className="flex flex-col gap-2.5 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted">
          {formatLocal(shift.startTime, "EEE d MMM").toUpperCase()} · {kind}
        </span>
        {done ? (
          <span className="bg-glow px-1.5 py-0.5 font-mono text-[10px] font-bold text-void">VOLTOOID</span>
        ) : (
          <span className="border border-gold px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">OPEN</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-bold">
          {formatLocal(shift.startTime, "HH:mm")} → {formatLocal(shift.endTime, "HH:mm")}
          {overnight && <span className="ml-1 text-xs text-muted">+1</span>}
        </span>
        <span className="font-mono text-xs font-bold">
          <span className="text-gold">+{formatEuro(pay.total)}</span> ·{" "}
          <span className="text-glow">+{Math.floor(pay.workedHours)} EXP</span>
        </span>
      </div>

      {shift.note && <p className="text-[13px] text-soft">{shift.note}</p>}

      {canComplete && (
        <form action={completeQuest.bind(null, shift.id)}>
          <button
            type="submit"
            className="h-11 w-full rounded border border-glow bg-panel-raised font-mono text-xs font-bold tracking-[0.14em] text-glow hover:bg-[#183052]"
          >
            QUEST VOLTOOIEN
          </button>
        </form>
      )}
    </Panel>
  );
}

/** Groepeer diensten per ISO-week, met een label als "WEEK 41 · 5–11 OKT". */
function groupByWeek(shifts: Shift[]) {
  const weeks: { key: string; label: string; shifts: Shift[] }[] = [];

  for (const shift of shifts) {
    const key = formatLocal(shift.startTime, "RRRR-II");
    let week = weeks.find((w) => w.key === key);

    if (!week) {
      const day = localDate(shift.startTime);
      const monday = addDays(day, 1 - Number(formatLocal(shift.startTime, "i")));
      const sunday = addDays(monday, 6);
      const noon = (date: string) => new Date(`${date}T12:00:00Z`);
      const label = `WEEK ${formatLocal(shift.startTime, "I")} · ${formatLocal(noon(monday), "d")}–${formatLocal(
        noon(sunday),
        "d MMM",
      ).toUpperCase()}`;
      week = { key, label, shifts: [] };
      weeks.push(week);
    }

    week.shifts.push(shift);
  }

  return weeks;
}

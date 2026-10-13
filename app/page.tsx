import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { echoMessage, levelFromHours, rankForLevel, titleFor } from "@/lib/game";
import { formatEuro, formatHours, formatLocal, monthRange, round2, shiftPay } from "@/lib/shifts";
import { Avatar } from "@/components/system/Avatar";
import { EchoMessage } from "@/components/system/Echo";
import { Label, Panel, SegmentBar } from "@/components/system/Panel";
import { Screen } from "@/components/system/Screen";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const now = new Date();
  const { start, end } = monthRange(now);

  const shifts = await prisma.shift.findMany({ orderBy: { startTime: "asc" } });

  // Speler: level en titel over al je gewerkte diensten ooit.
  const worked = shifts.filter((s) => s.status === "WORKED");
  const totalHours = worked.reduce((sum, s) => sum + shiftPay(s).workedHours, 0);
  const { level, exp, expNeeded } = levelFromHours(totalHours);
  const rank = rankForLevel(level);
  const title = titleFor(worked);

  // Deze maand: verdiend, prognose en de maandquest.
  const month = shifts.filter((s) => s.startTime >= start && s.startTime < end);
  const monthWorked = month.filter((s) => s.status === "WORKED");
  const sum = (list: typeof shifts, pick: (p: ReturnType<typeof shiftPay>) => number) =>
    round2(list.reduce((total, s) => total + pick(shiftPay(s)), 0));

  const earned = sum(monthWorked, (p) => p.total);
  const bonus = sum(monthWorked, (p) => p.bonus);
  const hours = sum(monthWorked, (p) => p.workedHours);
  const nightHours = sum(monthWorked, (p) => p.nightHours);
  const forecast = sum(month, (p) => p.total);

  const next = shifts.find((s) => s.status === "PLANNED" && s.startTime >= now);
  const echo = echoMessage(next, now);
  const monthName = formatLocal(now, "MMMM").toUpperCase();

  return (
    <Screen>
      <h1 className="sr-only">Status</h1>

      <EchoMessage mood={echo.mood}>{echo.text}</EchoMessage>

      <Panel corners className="flex flex-col gap-3 px-4 pb-4 pt-3.5">
        <div className="flex items-center gap-3.5">
          <Avatar rank={rank} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Label>SPELER</Label>
            <span className="text-[22px] font-bold leading-tight">Speler</span>
            <span className="text-[13px] text-muted">
              Titel: <span className="text-gold">{title}</span>
            </span>
            <div className="mt-1.5 flex items-center gap-2.5">
              <span className="border border-glow px-2 py-1 font-mono text-[11px] font-bold text-glow">RANG {rank}</span>
              <span className="flex items-baseline gap-1">
                <span className="font-mono text-xs text-muted">LV.</span>
                <span className="text-[38px] font-bold leading-[0.9] text-glow [text-shadow:0_0_14px_rgb(63_184_255/0.55)]">
                  {level}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px] tracking-wider text-muted">
            <span>EXP · NOG {expNeeded - exp} UUR TOT LV. {level + 1}</span>
            <span>
              {exp} / {expNeeded}
            </span>
          </div>
          <div className="h-2 border border-line bg-void p-px">
            <div className="h-full bg-glow shadow-glow-strong" style={{ width: `${(exp / expNeeded) * 100}%` }} />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="GOUD" value={formatEuro(earned)} gold />
        <Stat label="BONUS" value={`+${formatEuro(bonus)}`} />
        <Stat label="UREN" value={formatHours(hours)} />
        <Stat label="NACHT" value={`${formatHours(nightHours)} u`} />
      </div>

      <Panel className="flex flex-col gap-2.5 p-3.5">
        <div className="flex items-center justify-between">
          <Label className="text-glow">MAANDQUEST · {monthName}</Label>
          {month.length > 0 && (
            <span
              className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                monthWorked.length === month.length ? "border-glow text-glow" : "border-gold text-gold"
              }`}
            >
              {monthWorked.length === month.length ? "VOLTOOID" : "BEZIG"}
            </span>
          )}
        </div>
        {month.length === 0 ? (
          <p className="text-sm text-soft">Nog geen quests deze maand. Voeg je rooster toe om de maandquest te starten.</p>
        ) : (
          <>
            <span className="text-base font-semibold">Voltooi {month.length} diensten</span>
            <SegmentBar
              done={monthWorked.length}
              total={month.length}
              label={`${monthWorked.length} van ${month.length} diensten voltooid`}
            />
            <div className="flex justify-between text-[13px] text-muted">
              <span>
                {monthWorked.length} / {month.length} voltooid
              </span>
              <span>
                Beloning: <strong className="text-gold">{formatEuro(forecast)}</strong>
              </span>
            </div>
          </>
        )}
      </Panel>

      {next && <NextQuest shift={next} />}
    </Screen>
  );
}

function Stat({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <Panel className="flex min-w-0 flex-col gap-1 px-3 py-2.5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted">{label}</span>
      <span className={`truncate text-xl font-bold ${gold ? "text-gold" : ""}`}>{value}</span>
    </Panel>
  );
}

function NextQuest({ shift }: { shift: { startTime: Date; endTime: Date; breakMinutes: number } }) {
  const pay = shiftPay(shift);
  return (
    <Link
      href="/quests"
      className="flex items-center gap-3 rounded-md border border-glow bg-panel px-3.5 py-3 hover:bg-panel-raised"
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted">
          VOLGENDE QUEST · {formatLocal(shift.startTime, "EEE d MMM").toUpperCase()}
        </span>
        <span className="text-[19px] font-bold">
          {formatLocal(shift.startTime, "HH:mm")} – {formatLocal(shift.endTime, "HH:mm")}
        </span>
      </div>
      <div className="ml-auto flex flex-col items-end gap-0.5 font-mono text-xs font-bold">
        <span className="text-gold">+{formatEuro(pay.total)}</span>
        <span className="text-glow">+{Math.floor(pay.workedHours)} EXP</span>
      </div>
    </Link>
  );
}

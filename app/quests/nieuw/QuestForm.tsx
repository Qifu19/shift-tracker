"use client";

import { useActionState, useState } from "react";
import { formatEuro, formatHours, formatLocal, shiftPay, toShiftMoments } from "@/lib/shifts";
import { EchoMessage } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";
import { createQuest, type QuestFormState } from "../actions";

// Een Client Component: de beloning rekent live mee terwijl je typt.
// Dat kan omdat lib/shifts.ts alleen pure functies bevat, die net zo goed
// in de browser draaien als op de server.

const fieldClass =
  "h-12 w-full rounded-md border border-line bg-panel px-3 text-base text-ink focus:border-glow focus:outline-none";
const inputClass = `${fieldClass} font-mono`;

export function QuestForm({ today }: { today: string }) {
  const [state, formAction, pending] = useActionState<QuestFormState, FormData>(createQuest, {});
  const [status, setStatus] = useState<"PLANNED" | "WORKED">("PLANNED");
  const [date, setDate] = useState(today);
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("06:30");
  const [breakMinutes, setBreakMinutes] = useState("30");

  const valid = date && start && end && Number(breakMinutes) >= 0;
  const moments = valid ? toShiftMoments(date, start, end) : null;
  const pay = moments ? shiftPay({ ...moments, breakMinutes: Number(breakMinutes) }) : null;

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <fieldset className="grid grid-cols-2 overflow-hidden rounded-md border border-line">
        <legend className="sr-only">Status</legend>
        <input type="hidden" name="status" value={status} />
        {(["PLANNED", "WORKED"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={`h-11 font-mono text-xs font-bold tracking-[0.12em] ${
              status === value ? "bg-panel-raised text-glow shadow-[inset_0_-2px_0_var(--color-glow)]" : "bg-panel text-muted"
            }`}
          >
            {value === "PLANNED" ? "OPEN" : "VOLTOOID"}
          </button>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <Label>DATUM</Label>
        <input type="date" name="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </label>

      <div className="grid grid-cols-3 gap-2.5">
        <label className="flex flex-col gap-1.5">
          <Label>START</Label>
          <input type="time" name="start" required value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>EINDE</Label>
          <input type="time" name="end" required value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>PAUZE MIN</Label>
          <input
            type="number"
            name="breakMinutes"
            min="0"
            step="5"
            required
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <Label>NOTITIE (OPTIONEEL)</Label>
        <input type="text" name="note" maxLength={200} placeholder="Bijv. andere locatie" className={fieldClass} />
      </label>

      {moments?.overnight && (
        <EchoMessage mood="waarschuwing">
          Deze quest loopt over middernacht. Hij eindigt <strong>{formatLocal(moments.endTime, "EEE d MMM 'om' HH:mm")}</strong>.
        </EchoMessage>
      )}

      {pay && (
        <Panel className="flex flex-col gap-2 p-3.5" >
          <Label className="text-glow">BELONING</Label>
          <Row label={`Basis · ${formatHours(pay.workedHours)} u`} value={formatEuro(pay.base)} />
          <Row label={`Nachtbonus · ${formatHours(pay.nightHours)} u`} value={formatEuro(pay.bonus)} />
          <Row label="Ervaring" value={`+${Math.floor(pay.workedHours)} EXP`} glow />
          <div className="h-px bg-line" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Totaal goud</span>
            <span className="text-2xl font-bold text-gold">{formatEuro(pay.total)}</span>
          </div>
        </Panel>
      )}

      {state.error && (
        <p role="alert" className="rounded-md border border-warn bg-warn-panel px-3 py-2.5 text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-14 rounded-md bg-glow font-mono text-sm font-bold tracking-[0.16em] text-void shadow-glow-strong disabled:opacity-60"
      >
        {pending ? "BEZIG MET OPSLAAN…" : "QUEST ACCEPTEREN"}
      </button>
    </form>
  );
}

function Row({ label, value, glow = false }: { label: string; value: string; glow?: boolean }) {
  return (
    <div className="flex justify-between text-sm text-muted">
      <span>{label}</span>
      <span className={`font-mono ${glow ? "text-glow" : "text-ink"}`}>{value}</span>
    </div>
  );
}

"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { parsePaySettings, sameSettings, toInput, type PaySettingsInput } from "@/lib/pay-settings";
import { formatEuro, round2, shiftPay, type PaySettings, type ShiftTimes } from "@/lib/shifts";
import { EchoMessage } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";
import { updatePaySettings, type PaySettingsState } from "./actions";

// Het instellingenformulier. Opslaan gaat in twee stappen:
// 1. "Wijzigingen opslaan" controleert de invoer en opent een bevestigingsvenster
//    met oud → nieuw en het effect op je maandtotaal.
// 2. Pas "Ja, wijzigen" in dat venster stuurt het formulier echt naar de server.
//    Ook Enter in een veld opent eerst het venster.

const inputClass =
  "h-11 w-full rounded border border-line bg-void px-3 font-mono text-base text-ink focus:border-glow focus:outline-none";

const hours = Array.from({ length: 24 }, (_, h) => h);
const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  current: PaySettings;
  /** De diensten van deze maand, om het effect op je maandtotaal te laten zien. */
  monthShifts: ShiftTimes[];
};

export function PaySettingsForm({ current, monthShifts }: Props) {
  const [state, formAction, pending] = useActionState<PaySettingsState, FormData>(updatePaySettings, {});
  const [input, setInput] = useState<PaySettingsInput>(() => toInput(current));
  const [checkError, setCheckError] = useState<string>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const parsed = parsePaySettings(input);
  const changed = parsed.settings ? !sameSettings(parsed.settings, current) : true;

  // Na een geslaagde opslag het venster sluiten.
  useEffect(() => {
    if (state.savedAt) dialogRef.current?.close();
  }, [state.savedAt]);

  const set = (field: keyof PaySettingsInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInput((prev) => ({ ...prev, [field]: e.target.value }));

  // We versturen het formulier zelf in plaats van met <form action>:
  // 1. Enter in een veld opent zo het bevestigingsvenster, in plaats van
  //    direct op te slaan zonder bevestiging.
  // 2. React maakt een <form action> na het opslaan automatisch leeg, waardoor
  //    de keuzelijsten terugsprongen naar hun oude waarde.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialogRef.current?.open) {
      askConfirmation();
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function askConfirmation() {
    if (parsed.error) {
      setCheckError(parsed.error);
      return;
    }
    setCheckError(undefined);
    dialogRef.current?.showModal();
  }

  const monthTotal = (settings: PaySettings) =>
    round2(monthShifts.reduce((sum, shift) => sum + shiftPay(shift, settings).total, 0));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Panel className="flex flex-col gap-3.5 p-3.5">
        <label className="flex flex-col gap-1.5">
          <Label>UURLOON (BRUTO, €)</Label>
          <input
            name="hourlyWage"
            inputMode="decimal"
            value={input.hourlyWage}
            onChange={set("hourlyWage")}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <Label>NACHTTOESLAG (%)</Label>
          <input
            name="nightBonusPercent"
            inputMode="numeric"
            value={input.nightBonusPercent}
            onChange={set("nightBonusPercent")}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5">
            <Label>NACHT VAN</Label>
            <select name="nightStartHour" value={input.nightStartHour} onChange={set("nightStartHour")} className={inputClass}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {pad(h)}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>NACHT TOT</Label>
            <select name="nightEndHour" value={input.nightEndHour} onChange={set("nightEndHour")} className={inputClass}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {pad(h)}:00
                </option>
              ))}
            </select>
          </label>
        </div>

        {(checkError ?? state.error) && (
          <p role="alert" className="rounded border border-warn bg-warn-panel px-3 py-2.5 text-sm">
            {checkError ?? state.error}
          </p>
        )}

        <button
          type="button"
          onClick={askConfirmation}
          disabled={!changed}
          className="h-11 rounded border border-glow bg-panel-raised font-mono text-xs font-bold tracking-[0.14em] text-glow disabled:border-line disabled:bg-panel disabled:text-muted"
        >
          {changed ? "WIJZIGINGEN OPSLAAN" : "GEEN WIJZIGINGEN"}
        </button>
      </Panel>

      {state.savedAt && !changed && (
        <EchoMessage mood="blij">Instellingen opgeslagen. Al je beloningen zijn opnieuw berekend.</EchoMessage>
      )}

      {/* Het bevestigingsvenster. <dialog> regelt zelf de focus en sluit met Escape. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        className="m-auto w-[calc(100%-36px)] max-w-sm rounded-md border border-warn bg-panel p-0 text-ink backdrop:bg-black/75"
      >
        {parsed.settings && (
          <div className="flex flex-col gap-4 p-4">
            <EchoMessage mood="waarschuwing">
              Weet je het zeker? Dit verandert de bedragen van <strong>al je diensten</strong>, ook die van vorige maanden.
            </EchoMessage>

            <h2 id="confirm-title" className="text-lg font-bold">
              Instellingen wijzigen
            </h2>

            <dl className="flex flex-col gap-2 text-sm">
              <Change label="Uurloon" from={formatEuro(current.hourlyWage)} to={formatEuro(parsed.settings.hourlyWage)} />
              <Change
                label="Nachttoeslag"
                from={`+${Math.round(current.nightBonus * 100)}%`}
                to={`+${Math.round(parsed.settings.nightBonus * 100)}%`}
              />
              <Change
                label="Nacht"
                from={`${pad(current.nightStartHour)}:00–${pad(current.nightEndHour)}:00`}
                to={`${pad(parsed.settings.nightStartHour)}:00–${pad(parsed.settings.nightEndHour)}:00`}
              />
              {monthShifts.length > 0 && (
                <Change
                  label="Maandtotaal"
                  from={formatEuro(monthTotal(current))}
                  to={formatEuro(monthTotal(parsed.settings))}
                  gold
                />
              )}
            </dl>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="h-11 rounded border border-line font-mono text-xs font-bold tracking-[0.14em] text-muted hover:text-ink"
              >
                ANNULEREN
              </button>
              <button
                type="submit"
                disabled={pending}
                className="h-11 rounded bg-warn font-mono text-xs font-bold tracking-[0.14em] text-void disabled:opacity-60"
              >
                {pending ? "BEZIG…" : "JA, WIJZIGEN"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </form>
  );
}

function Change({ label, from, to, gold = false }: { label: string; from: string; to: string; gold?: boolean }) {
  const same = from === to;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-mono">
        {same ? (
          <span className="text-muted">{from}</span>
        ) : (
          <>
            <span className="text-muted line-through">{from}</span>
            <span aria-hidden>→</span>
            <span className="sr-only">wordt</span>
            <span className={`font-bold ${gold ? "text-gold" : "text-glow"}`}>{to}</span>
          </>
        )}
      </dd>
    </div>
  );
}

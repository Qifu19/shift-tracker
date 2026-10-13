import { PAY_SETTINGS, formatEuro } from "@/lib/shifts";
import { HOURS_PER_LEVEL } from "@/lib/game";
import { Echo } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";
import { Screen } from "@/components/system/Screen";

// Voorlopig alleen-lezen: de instellingen staan nog vast in lib/shifts.ts.
// Zodra er een Settings-tabel in de database is, worden dit invulvelden.

export default function SystemPage() {
  const { hourlyWage, nightBonus, nightStartHour, nightEndHour } = PAY_SETTINGS;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Screen>
      <header className="mb-1 flex flex-col gap-1">
        <Label className="text-glow">[ CONFIGURATIE ]</Label>
        <h1 className="text-[28px] font-bold">Systeem</h1>
      </header>

      <h2 className="mt-1"><Label>LOON</Label></h2>
      <Panel className="flex min-h-[52px] items-center justify-between px-3.5">
        <span className="font-medium">Uurloon (bruto)</span>
        <span className="font-mono font-bold text-gold">{formatEuro(hourlyWage)}</span>
      </Panel>

      <h2 className="mt-1"><Label>BONUSREGELS</Label></h2>
      <Panel className="flex min-h-14 items-center gap-2.5 px-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">Nachtbonus</span>
          <span className="font-mono text-[11px] text-muted">
            {pad(nightStartHour)}:00 – {pad(nightEndHour)}:00 · ELKE DAG
          </span>
        </div>
        <span className="ml-auto font-mono font-bold text-glow">+{Math.round(nightBonus * 100)}%</span>
      </Panel>

      <h2 className="mt-1"><Label>SPELREGELS</Label></h2>
      <Panel className="flex min-h-[52px] items-center justify-between px-3.5">
        <span className="font-medium">Uren per level</span>
        <span className="font-mono font-bold text-glow">{HOURS_PER_LEVEL}</span>
      </Panel>

      <div className="mt-2 flex items-center gap-2.5 rounded-md border border-dashed border-line px-3 py-2.5">
        <Echo size={32} />
        <p className="text-[13px] leading-snug text-soft">
          Deze instellingen kun je binnenkort zelf aanpassen. Daarna volgen de agenda-koppeling en de CSV-export.
        </p>
      </div>
    </Screen>
  );
}

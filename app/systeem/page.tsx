import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaySettings } from "@/lib/settings";
import { monthRange } from "@/lib/shifts";
import { signOut } from "@/app/auth-actions";
import { PaySettingsForm } from "./PaySettingsForm";
import { HOURS_PER_LEVEL } from "@/lib/game";
import { Echo } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";
import { Screen } from "@/components/system/Screen";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const user = await requireUser();
  const { start, end } = monthRange(new Date());

  const [settings, monthShifts] = await Promise.all([
    getPaySettings(user.id),
    prisma.shift.findMany({
      where: { userId: user.id, startTime: { gte: start, lt: end } },
      select: { startTime: true, endTime: true, breakMinutes: true },
    }),
  ]);

  return (
    <Screen>
      <header className="mb-1 flex flex-col gap-1">
        <Label className="text-glow">[ CONFIGURATIE ]</Label>
        <h1 className="text-[28px] font-bold">Systeem</h1>
      </header>

      <h2 className="mt-1"><Label>ACCOUNT</Label></h2>
      <Panel className="flex flex-col gap-3 p-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{user.name}</span>
          <span className="truncate font-mono text-xs text-muted">{user.email}</span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="h-11 w-full rounded border border-warn font-mono text-xs font-bold tracking-[0.14em] text-warn hover:bg-warn-panel"
          >
            UITLOGGEN
          </button>
        </form>
      </Panel>

      <h2 className="mt-1"><Label>LOON EN TOESLAG</Label></h2>
      <PaySettingsForm current={settings} monthShifts={monthShifts} />

      <h2 className="mt-1"><Label>SPELREGELS</Label></h2>
      <Panel className="flex min-h-[52px] items-center justify-between px-3.5">
        <span className="font-medium">Uren per level</span>
        <span className="font-mono font-bold text-glow">{HOURS_PER_LEVEL}</span>
      </Panel>

      <div className="mt-2 flex items-center gap-2.5 rounded-md border border-dashed border-line px-3 py-2.5">
        <Echo size={32} />
        <p className="text-[13px] leading-snug text-soft">
          Binnenkort: de agenda-koppeling met je iPhone en een export naar CSV.
        </p>
      </div>
    </Screen>
  );
}

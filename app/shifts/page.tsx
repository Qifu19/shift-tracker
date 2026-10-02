import { formatInTimeZone } from "date-fns-tz";
import { nl } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { createShift } from "./actions";

export const dynamic = "force-dynamic";

const TIME_ZONE = "Europe/Amsterdam";

function workedHours(start: Date, end: Date, breakMinutes: number) {
  const minutes = (end.getTime() - start.getTime()) / 60000 - breakMinutes;
  return (minutes / 60).toFixed(2);
}

function formatTime(date: Date, pattern: string) {
  return formatInTimeZone(date, TIME_ZONE, pattern, { locale: nl });
}

export default async function ShiftsPage() {
  const shifts = await prisma.shift.findMany({
    orderBy: { startTime: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mijn diensten</h1>

      <form action={createShift} className="mb-10 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Datum
          <input type="date" name="date" required className="rounded border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Pauze (minuten)
          <input type="number" name="breakMinutes" min="0" defaultValue="0" className="rounded border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Begintijd
          <input type="time" name="start" required className="rounded border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Eindtijd
          <input type="time" name="end" required className="rounded border p-2" />
        </label>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-medium text-white sm:col-span-2">
          Dienst toevoegen
        </button>
      </form>

      {shifts.length === 0 ? (
        <p>Nog geen diensten ingevoerd.</p>
      ) : (
        <ul className="divide-y">
          {shifts.map((shift) => (
            <li key={shift.id} className="flex justify-between py-3">
              <span>
                {formatTime(shift.startTime, "EEE d MMM, HH:mm")} – {formatTime(shift.endTime, "HH:mm")}
              </span>
              <span>{workedHours(shift.startTime, shift.endTime, shift.breakMinutes)} uur</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
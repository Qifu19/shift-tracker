"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "Europe/Amsterdam";

export async function createShift(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const breakMinutes = Number(formData.get("breakMinutes") ?? 0);

  if (!date || !start || !end) {
    throw new Error("Datum, begintijd en eindtijd zijn verplicht.");
  }

  const startTime = fromZonedTime(`${date}T${start}`, TIME_ZONE);
  let endTime = fromZonedTime(`${date}T${end}`, TIME_ZONE);

  // Eindtijd vóór begintijd? Dan loopt de dienst over middernacht.
  if (endTime <= startTime) {
    const nextDay = new Date(`${date}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const nextDate = nextDay.toISOString().slice(0, 10);
    endTime = fromZonedTime(`${nextDate}T${end}`, TIME_ZONE);
  }

  await prisma.shift.create({
    data: { startTime, endTime, breakMinutes },
  });

  revalidatePath("/shifts");
}
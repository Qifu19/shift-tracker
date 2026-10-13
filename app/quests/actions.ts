"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toShiftMoments, workedMinutes } from "@/lib/shifts";

export type QuestFormState = { error?: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

/**
 * Maakt een nieuwe quest (dienst) aan.
 * Gebruikt met useActionState: bij een fout geven we een melding terug in
 * plaats van een foutpagina; bij succes sturen we je door naar de questlog.
 */
export async function createQuest(_prev: QuestFormState, formData: FormData): Promise<QuestFormState> {
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const breakMinutes = Number(formData.get("breakMinutes") ?? 0);
  const status = formData.get("status") === "WORKED" ? "WORKED" : "PLANNED";
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!DATE.test(date) || !TIME.test(start) || !TIME.test(end)) {
    return { error: "Vul een datum, begintijd en eindtijd in." };
  }
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    return { error: "De pauze moet een heel aantal minuten zijn, 0 of meer." };
  }

  const { startTime, endTime } = toShiftMoments(date, start, end);
  if (workedMinutes({ startTime, endTime, breakMinutes }) <= 0) {
    return { error: "De pauze is langer dan de dienst zelf." };
  }

  await prisma.shift.create({
    data: { startTime, endTime, breakMinutes, status, note },
  });

  revalidatePath("/");
  revalidatePath("/quests");
  redirect("/quests");
}

/** Zet een geplande quest op voltooid. */
export async function completeQuest(id: string) {
  await prisma.shift.update({
    where: { id },
    data: { status: "WORKED" },
  });

  revalidatePath("/");
  revalidatePath("/quests");
}

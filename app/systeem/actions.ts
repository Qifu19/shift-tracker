"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { parsePaySettings } from "@/lib/pay-settings";
import { savePaySettings } from "@/lib/settings";

export type PaySettingsState = { error?: string; savedAt?: number };

/**
 * Slaat de loon-instellingen op. Wordt pas aangeroepen nadat je in het
 * bevestigingsvenster op "Ja, wijzigen" hebt geklikt.
 * De browser controleert de invoer al, maar de server controleert alles
 * opnieuw: een formulier kun je namelijk altijd omzeilen.
 */
export async function updatePaySettings(_prev: PaySettingsState, formData: FormData): Promise<PaySettingsState> {
  const user = await requireUser();

  const result = parsePaySettings({
    hourlyWage: String(formData.get("hourlyWage") ?? ""),
    nightBonusPercent: String(formData.get("nightBonusPercent") ?? ""),
    nightStartHour: String(formData.get("nightStartHour") ?? ""),
    nightEndHour: String(formData.get("nightEndHour") ?? ""),
  });
  if (!result.settings) return { error: result.error };

  await savePaySettings(user.id, result.settings);

  // Alle bedragen hangen van deze instellingen af, dus elke pagina opnieuw opbouwen.
  revalidatePath("/", "layout");
  return { savedAt: Date.now() };
}

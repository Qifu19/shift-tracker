import { prisma } from "./prisma";
import { DEFAULT_PAY_SETTINGS, type PaySettings } from "./shifts";

// Haalt de loon-instellingen van een gebruiker op uit de database.
// Heeft iemand nog niets ingesteld, dan gelden de standaardwaarden.
//
// In de database staan bedragen in centen en de toeslag als heel percentage.
// Zo voorkom je afrondingsfouten met kommagetallen (0,1 + 0,2 is in
// JavaScript namelijk niet precies 0,3).

export async function getPaySettings(userId: string): Promise<PaySettings> {
  const row = await prisma.paySettings.findUnique({ where: { userId } });
  if (!row) return DEFAULT_PAY_SETTINGS;

  return {
    hourlyWage: row.hourlyWageCents / 100,
    nightBonus: row.nightBonusPercent / 100,
    nightStartHour: row.nightStartHour,
    nightEndHour: row.nightEndHour,
  };
}

export async function savePaySettings(userId: string, settings: PaySettings) {
  const data = {
    hourlyWageCents: Math.round(settings.hourlyWage * 100),
    nightBonusPercent: Math.round(settings.nightBonus * 100),
    nightStartHour: settings.nightStartHour,
    nightEndHour: settings.nightEndHour,
  };

  // upsert: bijwerken als de rij bestaat, anders aanmaken.
  await prisma.paySettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

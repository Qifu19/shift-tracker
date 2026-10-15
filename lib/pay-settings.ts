import type { PaySettings } from "./shifts";

// Het controleren van het instellingenformulier. Puur en zonder database,
// zodat dezelfde controle in de browser (voor het bevestigingsvenster) en op
// de server (voordat we opslaan) draait, en zodat we het kunnen testen.

export type PaySettingsInput = {
  hourlyWage: string; // zoals getypt, bijv. "15,50"
  nightBonusPercent: string; // bijv. "30"
  nightStartHour: string; // "0"–"23"
  nightEndHour: string;
};

export type ParseResult = { settings: PaySettings; error?: undefined } | { settings?: undefined; error: string };

export function parsePaySettings(input: PaySettingsInput): ParseResult {
  // Een bedrag als "15", "15,5" of "15.50": hoogstens twee cijfers achter de komma.
  const wageText = input.hourlyWage.trim();
  if (!/^\d{1,3}([.,]\d{1,2})?$/.test(wageText)) {
    return { error: "Vul een uurloon in als bedrag, bijvoorbeeld 15,50." };
  }
  // Nederlanders typen een komma; JavaScript verwacht een punt.
  const wage = Number(wageText.replace(",", "."));
  const percentText = input.nightBonusPercent.trim();
  const percent = /^\d{1,3}$/.test(percentText) ? Number(percentText) : NaN;
  const start = Number(input.nightStartHour);
  const end = Number(input.nightEndHour);

  if (wage <= 0 || wage > 200) {
    return { error: "Vul een uurloon in tussen € 0,01 en € 200." };
  }
  if (!Number.isInteger(percent) || percent < 0 || percent > 200) {
    return { error: "De nachttoeslag moet een heel percentage zijn tussen 0 en 200." };
  }
  if (!isHour(start) || !isHour(end)) {
    return { error: "Kies een geldig begin- en einduur voor de nacht." };
  }
  if (start === end) {
    return { error: "Het nachtvenster moet een begin en een eind hebben die verschillen." };
  }

  return {
    settings: {
      hourlyWage: Math.round(wage * 100) / 100,
      nightBonus: percent / 100,
      nightStartHour: start,
      nightEndHour: end,
    },
  };
}

function isHour(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 23;
}

/** Zet instellingen om naar de tekst die in het formulier staat. */
export function toInput(settings: PaySettings): PaySettingsInput {
  return {
    hourlyWage: settings.hourlyWage.toFixed(2).replace(".", ","),
    nightBonusPercent: String(Math.round(settings.nightBonus * 100)),
    nightStartHour: String(settings.nightStartHour),
    nightEndHour: String(settings.nightEndHour),
  };
}

export function sameSettings(a: PaySettings, b: PaySettings) {
  return (
    a.hourlyWage === b.hourlyWage &&
    Math.round(a.nightBonus * 100) === Math.round(b.nightBonus * 100) &&
    a.nightStartHour === b.nightStartHour &&
    a.nightEndHour === b.nightEndHour
  );
}

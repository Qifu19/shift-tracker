"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

export type AuthFormState = { error?: string; email?: string; name?: string };

// Better Auth geeft Engelse foutcodes terug. Hier vertalen we de codes die
// een gebruiker kan tegenkomen naar een duidelijke Nederlandse melding.
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Dit e-mailadres en wachtwoord horen niet bij elkaar.",
  USER_ALREADY_EXISTS: "Er bestaat al een account met dit e-mailadres.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Er bestaat al een account met dit e-mailadres.",
  INVALID_EMAIL: "Dit is geen geldig e-mailadres.",
  PASSWORD_TOO_SHORT: "Je wachtwoord moet minstens 8 tekens lang zijn.",
  PASSWORD_TOO_LONG: "Je wachtwoord is te lang.",
};

function toMessage(error: unknown) {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code && messages[code]) return messages[code];
  }
  console.error(error);
  return "Er ging iets mis. Probeer het nog eens.";
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await auth.api.signInEmail({ body: { email, password } });
  } catch (error) {
    return { error: toMessage(error), email };
  }

  // redirect() buiten de try: het werkt door een speciale fout te gooien.
  redirect("/");
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2 || name.length > 30) {
    return { error: "Kies een spelersnaam van 2 tot 30 tekens.", email, name };
  }

  try {
    // Na het registreren ben je meteen ingelogd.
    await auth.api.signUpEmail({ body: { name, email, password } });
  } catch (error) {
    return { error: toMessage(error), email, name };
  }

  redirect("/");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

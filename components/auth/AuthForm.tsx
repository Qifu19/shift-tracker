"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/auth-actions";
import { Label } from "@/components/system/Panel";

const inputClass =
  "h-12 w-full rounded-md border border-line bg-void px-3 text-base text-ink focus:border-glow focus:outline-none";

/** Het formulier voor inloggen én registreren; `mode` bepaalt welke. */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(register ? signUp : signIn, {});

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      {register && (
        <label className="flex flex-col gap-1.5">
          <Label>SPELERSNAAM</Label>
          <input
            name="name"
            required
            minLength={2}
            maxLength={30}
            autoComplete="nickname"
            defaultValue={state.name}
            className={inputClass}
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <Label>E-MAIL</Label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>WACHTWOORD</Label>
        <input
          type="password"
          name="password"
          required
          minLength={register ? 8 : undefined}
          autoComplete={register ? "new-password" : "current-password"}
          className={inputClass}
        />
        {register && <span className="text-xs text-muted">Minstens 8 tekens.</span>}
      </label>

      {state.error && (
        <p role="alert" className="rounded-md border border-warn bg-warn-panel px-3 py-2.5 text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-14 rounded-md bg-glow font-mono text-sm font-bold tracking-[0.16em] text-void shadow-glow-strong disabled:opacity-60"
      >
        {pending ? "BEZIG…" : register ? "ACCOUNT AANMAKEN" : "INLOGGEN"}
      </button>

      <p className="text-center text-sm text-muted">
        {register ? "Heb je al een account? " : "Nog geen account? "}
        <Link href={register ? "/login" : "/registreren"} className="font-semibold text-glow underline-offset-4 hover:underline">
          {register ? "Log in" : "Registreer je"}
        </Link>
      </p>
    </form>
  );
}

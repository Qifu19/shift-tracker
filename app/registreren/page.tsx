import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = { title: "Registreren · Shift Tracker" };

export default function RegisterPage() {
  return (
    <AuthScreen title="Nieuwe speler" echo="Nieuwe speler gedetecteerd. Maak een account aan om je eerste quest te starten.">
      <AuthForm mode="register" />
    </AuthScreen>
  );
}

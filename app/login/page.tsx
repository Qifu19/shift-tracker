import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = { title: "Inloggen · Shift Tracker" };

export default function LoginPage() {
  return (
    <AuthScreen title="Inloggen" echo="Welkom terug. Identificeer jezelf om verder te gaan, speler.">
      <AuthForm mode="login" />
    </AuthScreen>
  );
}

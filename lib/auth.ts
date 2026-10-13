import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

// De configuratie van Better Auth: inloggen met e-mail en wachtwoord,
// opgeslagen in je eigen database via Prisma.

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dagen ingelogd blijven
  },
  // nextCookies zorgt dat inloggen vanuit een Server Action de cookie zet.
  // Moet als laatste plugin in de lijst staan.
  plugins: [nextCookies()],
});

/** De huidige sessie, of null als je niet bent ingelogd. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Geeft de ingelogde gebruiker terug, of stuurt je naar /login.
 * Gebruik dit bovenaan elke beveiligde pagina en Server Action: dit is de
 * echte controle. proxy.ts stuurt alleen alvast door voor de snelheid.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EchoMessage } from "@/components/system/Echo";
import { Label, Panel } from "@/components/system/Panel";

/** De gedeelde opbouw van het inlog- en registratiescherm. */
export async function AuthScreen({ title, echo, children }: { title: string; echo: string; children: ReactNode }) {
  // Al ingelogd? Dan heb je hier niets te zoeken.
  if (await getSession()) redirect("/");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-[18px] py-10">
      <div className="flex flex-col gap-1">
        <Label className="text-glow">[ SHIFT TRACKER ]</Label>
        <h1 className="text-[28px] font-bold">{title}</h1>
      </div>

      <EchoMessage>{echo}</EchoMessage>

      <Panel corners className="p-4">
        {children}
      </Panel>
    </main>
  );
}

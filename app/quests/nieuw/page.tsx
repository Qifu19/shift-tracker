import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { localDate } from "@/lib/shifts";
import { Screen } from "@/components/system/Screen";
import { QuestForm } from "./QuestForm";

export const dynamic = "force-dynamic";

export default async function NewQuestPage() {
  await requireUser();

  return (
    <Screen nav={false}>
      <header className="flex h-11 items-center justify-between">
        <Link href="/quests" className="flex h-11 w-20 items-center text-[15px] text-muted hover:text-ink">
          Annuleren
        </Link>
        <h1 className="text-[17px] font-bold">Nieuwe quest</h1>
        <span className="w-20" />
      </header>

      {/* De datum van vandaag bepalen we op de server, zodat server en browser hetzelfde tonen. */}
      <QuestForm today={localDate(new Date())} />
    </Screen>
  );
}

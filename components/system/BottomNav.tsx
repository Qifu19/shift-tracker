"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Dit is een Client Component, omdat hij moet weten op welke pagina je
// bent (usePathname). Dat kan alleen in de browser.

const tabs = [
  { href: "/", label: "STATUS" },
  { href: "/quests", label: "QUESTS" },
  { href: "/quests/nieuw", label: "Nieuwe quest", icon: true },
  { href: "/systeem", label: "SYSTEEM" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdmenu"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-[#070b14] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 font-mono">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          if (tab.icon) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="flex size-12 items-center justify-center rounded-md border border-glow text-glow shadow-glow"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center px-2.5 text-xs font-bold tracking-widest ${
                active ? "border-b-2 border-glow text-glow" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

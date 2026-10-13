import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/** De gemeenschappelijke paginaopbouw: een smalle kolom met het menu eronder. */
export function Screen({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <>
      <main className={`mx-auto flex w-full max-w-md flex-col gap-3 px-[18px] pt-6 ${nav ? "pb-28" : "pb-8"}`}>
        {children}
      </main>
      {nav && <BottomNav />}
    </>
  );
}

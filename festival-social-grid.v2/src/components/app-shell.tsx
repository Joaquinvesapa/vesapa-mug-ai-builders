import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { festival } from "@/config/festival";

/** Layout for signed-in screens. Pages must call requireUser() themselves. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/" className="truncate font-semibold tracking-tight">
            {festival.name}
          </Link>
          <nav className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-sm">
            <Link
              href="/lineup"
              className="rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Line-up
            </Link>
            <Link
              href="/grid"
              className="rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Mi grilla
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                Cerrar sesión
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { festival } from "@/config/festival";
import { getCurrentUser } from "@/server/auth/current-user";
import { getProfile } from "@/server/profile/profile";

/** Layout for signed-in screens. Pages must call requireUser() themselves. */
export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

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
            {profile && (
              <Link href="/profile" aria-label="Mi perfil" className="ml-1 rounded-full p-1 hover:bg-neutral-100">
                <Avatar avatar={profile.avatar} size={28} />
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/server/auth/current-user";

export default async function Home() {
  const user = await requireUser();

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Hola, {user.username}</h1>
      <Link
        href="/lineup"
        className="mt-6 block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 transition hover:ring-violet-300"
      >
        <span className="font-medium">Ver el line-up</span>
        <span className="mt-1 block text-sm text-neutral-500">
          Todos los shows, por día y por escenario.
        </span>
      </Link>
    </AppShell>
  );
}

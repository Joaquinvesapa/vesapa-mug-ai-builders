import { signOut } from "@/auth";
import { festival } from "@/config/festival";
import { requireUser } from "@/server/auth/current-user";

async function signOutAction(): Promise<void> {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight">{festival.name}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {user.username}</h1>
      </main>
    </div>
  );
}

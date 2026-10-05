import { signOut } from "@/auth";
import { requireUser } from "@/server/auth/current-user";

async function signOutAction(): Promise<void> {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function Home() {
  const user = await requireUser();

  return (
    <main>
      <h1>Hola, {user.username}</h1>
      <form action={signOutAction}>
        <button type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}

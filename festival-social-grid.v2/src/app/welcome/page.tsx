import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { UsernameForm } from "./username-form";

export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.username) redirect("/");

  return (
    <main>
      <h1>Elegí tu nombre de usuario</h1>
      <UsernameForm />
    </main>
  );
}

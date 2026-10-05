import { redirect } from "next/navigation";
import { CardPage } from "@/components/ui";
import { getCurrentUser } from "@/server/auth/current-user";
import { UsernameForm } from "./username-form";

export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.username) redirect("/");

  return (
    <CardPage
      title="Elegí tu nombre de usuario"
      subtitle="Es como te van a encontrar tus amigos. Entre 3 y 30 caracteres."
    >
      <UsernameForm />
    </CardPage>
  );
}

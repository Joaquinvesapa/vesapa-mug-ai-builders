import { redirect } from "next/navigation";
import { Button, CardPage } from "@/components/ui";
import { festival } from "@/config/festival";
import { getCurrentUser } from "@/server/auth/current-user";
import { signInWithGoogle } from "./actions";
import { EmailCodeForm } from "./email-code-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <CardPage title={festival.name} subtitle="Entrá para armar tu grilla">
      <form action={signInWithGoogle}>
        <Button type="submit" variant="secondary">
          Entrar con Google
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        <p>o con un código por email</p>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <EmailCodeForm />
    </CardPage>
  );
}

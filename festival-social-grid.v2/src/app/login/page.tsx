import { redirect } from "next/navigation";
import { festival } from "@/config/festival";
import { getCurrentUser } from "@/server/auth/current-user";
import { signInWithGoogle } from "./actions";
import { EmailCodeForm } from "./email-code-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main>
      <h1>{festival.name}</h1>
      <form action={signInWithGoogle}>
        <button type="submit">Entrar con Google</button>
      </form>
      <p>o con un código por email</p>
      <EmailCodeForm />
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { Button, Field, FormError } from "@/components/ui";
import { saveUsername, type WelcomeState } from "./actions";

export function UsernameForm() {
  const [state, action, pending] = useActionState<WelcomeState, FormData>(
    saveUsername,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Nombre de usuario"
        id="username"
        name="username"
        autoComplete="username"
        required
      />
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        Guardar
      </Button>
    </form>
  );
}

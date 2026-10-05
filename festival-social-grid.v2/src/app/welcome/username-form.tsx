"use client";

import { useActionState } from "react";
import { saveUsername, type WelcomeState } from "./actions";

export function UsernameForm() {
  const [state, action, pending] = useActionState<WelcomeState, FormData>(
    saveUsername,
    {},
  );

  return (
    <form action={action}>
      <label htmlFor="username">Nombre de usuario</label>
      <input id="username" name="username" required autoComplete="username" />
      <button type="submit" disabled={pending}>
        Guardar
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}

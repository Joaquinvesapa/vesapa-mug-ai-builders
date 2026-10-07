"use client";

import { useActionState } from "react";
import { Button, Field, FormError } from "@/components/ui";
import { pinLogin, type PinLoginState } from "./pin-actions";

export function PinForm() {
  const [state, action, pending] = useActionState<PinLoginState, FormData>(
    pinLogin,
    { step: "username" },
  );

  if (state.step === "username") {
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
          Continuar
        </Button>
      </form>
    );
  }

  const isNew = state.step === "new";
  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        {isNew ? "Creá un PIN de 6 dígitos para " : "Ingresá el PIN de "}
        <strong className="font-medium">{state.username}</strong>.
      </p>
      <input type="hidden" name="username" value={state.username} />
      <Field
        label="PIN"
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete={isNew ? "new-password" : "current-password"}
        pattern="\d{6}"
        maxLength={6}
        placeholder="••••••"
        className="h-12 rounded-xl border border-neutral-300 bg-white px-4 text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        required
      />
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {isNew ? "Crear cuenta" : "Entrar"}
      </Button>
    </form>
  );
}

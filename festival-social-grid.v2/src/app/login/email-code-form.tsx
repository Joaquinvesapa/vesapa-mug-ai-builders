"use client";

import { useActionState } from "react";
import { Button, Field, FormError } from "@/components/ui";
import { requestCode, verifyCode, type LoginState } from "./actions";

export function EmailCodeForm() {
  const [requestState, request, requesting] = useActionState<LoginState, FormData>(
    requestCode,
    { step: "email" },
  );
  const [verifyState, verify, verifying] = useActionState<LoginState, FormData>(
    verifyCode,
    { step: "email" },
  );

  if (requestState.step === "email") {
    return (
      <form action={request} className="flex flex-col gap-4">
        <Field
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          required
        />
        <FormError>{requestState.error}</FormError>
        <Button type="submit" disabled={requesting}>
          Enviar código
        </Button>
      </form>
    );
  }

  return (
    <form action={verify} className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Te enviamos un código a <strong className="font-medium">{requestState.email}</strong>.
      </p>
      <input type="hidden" name="email" value={requestState.email} />
      <Field
        label="Código"
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        placeholder="000000"
        className="h-12 rounded-xl border border-neutral-300 bg-white px-4 text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        required
      />
      <FormError>{verifyState.error}</FormError>
      <Button type="submit" disabled={verifying}>
        Entrar
      </Button>
    </form>
  );
}

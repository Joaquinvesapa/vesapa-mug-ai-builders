"use client";

import { useActionState } from "react";
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
      <form action={request}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <button type="submit" disabled={requesting}>
          Enviar código
        </button>
        {requestState.error && <p role="alert">{requestState.error}</p>}
      </form>
    );
  }

  return (
    <form action={verify}>
      <p>Te enviamos un código a {requestState.email}.</p>
      <input type="hidden" name="email" value={requestState.email} />
      <label htmlFor="code">Código</label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
      />
      <button type="submit" disabled={verifying}>
        Entrar
      </button>
      {verifyState.error && <p role="alert">{verifyState.error}</p>}
    </form>
  );
}

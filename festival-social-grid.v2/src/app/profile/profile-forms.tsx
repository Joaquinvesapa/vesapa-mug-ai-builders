"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button, Field, FormError } from "@/components/ui";
import { AVATAR_SHAPES, AVATAR_SHAPE_LABELS, type Avatar as AvatarValue } from "@/lib/avatar";
import { saveAvatar, saveUsername, type FormState } from "./actions";

const card = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200";

export function UsernameForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveUsername, {});
  return (
    <form action={action} className={`${card} flex flex-col gap-4`}>
      <Field
        label="Nombre de usuario"
        id="username"
        name="username"
        defaultValue={username}
        autoComplete="username"
        required
      />
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        Guardar nombre
      </Button>
    </form>
  );
}

export function AvatarForm({ avatar }: { avatar: AvatarValue }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAvatar, {});
  const [shape, setShape] = useState(avatar.shape);
  const [color, setColor] = useState(avatar.color);

  return (
    <form action={action} className={`${card} flex flex-col gap-5`}>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-700">Forma</legend>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_SHAPES.map((option) => (
            <label
              key={option}
              className="relative flex cursor-pointer items-center justify-center rounded-xl p-2 ring-1 ring-neutral-200 has-checked:bg-violet-50 has-checked:ring-2 has-checked:ring-violet-500 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-600"
            >
              <input
                type="radio"
                name="shape"
                value={option}
                checked={shape === option}
                onChange={() => setShape(option)}
                aria-label={AVATAR_SHAPE_LABELS[option]}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <Avatar avatar={{ shape: option, color }} size={32} />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <label htmlFor="color" className="text-sm font-medium text-neutral-700">
          Color
        </label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue={avatar.color}
          onInput={(e) => setColor(e.currentTarget.value)}
          className="h-10 w-16 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        Guardar avatar
      </Button>
    </form>
  );
}

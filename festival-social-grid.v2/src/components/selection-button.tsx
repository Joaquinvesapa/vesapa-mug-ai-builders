"use client";

import { useFormStatus } from "react-dom";
import { toggleSelection } from "@/app/grid/actions";

function ToggleButton({ artist, selected }: { artist: string; selected: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={selected ? `Quitar ${artist} de mi grilla` : `Agregar ${artist} a mi grilla`}
      aria-pressed={selected}
      className={`flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-60 ${
        selected
          ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {selected ? "✓ En mi grilla" : "+ Agregar"}
    </button>
  );
}

/** Adds or removes a show from the signed-in person's grid. */
export function SelectionButton({
  showId,
  artist,
  selected,
}: {
  showId: string;
  artist: string;
  selected: boolean;
}) {
  return (
    <form action={toggleSelection}>
      <input type="hidden" name="showId" value={showId} />
      <input type="hidden" name="selected" value={String(selected)} />
      <ToggleButton artist={artist} selected={selected} />
    </form>
  );
}

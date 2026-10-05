import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { formatFestivalDay, formatFestivalTime } from "@/lib/festival-time";
import { requireUser } from "@/server/auth/current-user";
import { getShow } from "@/server/lineup/queries";

export default async function ShowPage({ params }: PageProps<"/lineup/[id]">) {
  await requireUser();
  const { id } = await params;
  const show = await getShow(id);
  if (!show) notFound();

  return (
    <AppShell>
      <Link href="/lineup" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al line-up
      </Link>
      <article className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="text-2xl font-semibold tracking-tight">{show.artist}</h1>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-neutral-500">Día</dt>
          <dd className="capitalize">{formatFestivalDay(show.day)}</dd>
          <dt className="text-neutral-500">Escenario</dt>
          <dd>{show.stage}</dd>
          <dt className="text-neutral-500">Horario</dt>
          <dd className="font-mono">
            {formatFestivalTime(show.startsAt)} – {formatFestivalTime(show.endsAt)}
          </dd>
        </dl>
        <p className="mt-6 whitespace-pre-line text-neutral-700">{show.description}</p>
      </article>
    </AppShell>
  );
}

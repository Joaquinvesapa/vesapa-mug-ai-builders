import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ExportForm } from "./export-form";
import { SelectionButton } from "@/components/selection-button";
import { findOverlaps, groupByDay } from "@/lib/grid";
import { formatFestivalDay, formatFestivalTime } from "@/lib/festival-time";
import { requireUser } from "@/server/auth/current-user";
import { listSelectedShows } from "@/server/grid/selections";

export default async function GridPage() {
  const user = await requireUser();
  const shows = await listSelectedShows(user.id);
  const overlaps = findOverlaps(shows);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Mi grilla</h1>

      {shows.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-neutral-200">
          <p className="text-neutral-600">Todavía no agregaste shows.</p>
          <Link
            href="/lineup"
            className="mt-4 inline-block rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Explorar el line-up
          </Link>
        </div>
      ) : (
        <>
          {overlaps.length > 0 && (
            <div
              role="status"
              className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200"
            >
              <p className="font-medium">Tenés shows superpuestos</p>
              <ul className="mt-1 list-disc pl-5">
                {overlaps.map(([a, b]) => (
                  <li key={`${a.id}-${b.id}`}>
                    {a.artist} se superpone con {b.artist}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {groupByDay(shows).map(({ day, shows: dayShows }) => {
            const label = formatFestivalDay(day);
            return (
              <section key={day} className="mt-6">
                <h2 className="mb-2 text-sm font-semibold first-letter:uppercase text-neutral-500">{label}</h2>
                <ul aria-label={`Shows del ${label}`} className="flex flex-col gap-2">
                  {dayShows.map((show) => (
                    <li
                      key={show.id}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200"
                    >
                      <div className="w-14 shrink-0 text-center font-mono text-sm">
                        <div className="font-semibold">{formatFestivalTime(show.startsAt)}</div>
                        <div className="text-neutral-400">{formatFestivalTime(show.endsAt)}</div>
                      </div>
                      <Link href={`/lineup/${show.id}`} className="min-w-0 flex-1">
                        <div className="truncate font-medium">{show.artist}</div>
                        <div className="truncate text-sm text-neutral-500">{show.stage}</div>
                      </Link>
                      <SelectionButton showId={show.id} artist={show.artist} selected />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <ExportForm days={groupByDay(shows).map((g) => g.day)} />
        </>
      )}
    </AppShell>
  );
}

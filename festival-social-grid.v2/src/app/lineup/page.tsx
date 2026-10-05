import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { festival } from "@/config/festival";
import { festivalDays, formatFestivalDay, formatFestivalTime } from "@/lib/festival-time";
import { requireUser } from "@/server/auth/current-user";
import { listShows, listStages, type ShowFilters } from "@/server/lineup/queries";

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function filterHref(filters: ShowFilters): string {
  const params = new URLSearchParams();
  if (filters.day) params.set("day", filters.day);
  if (filters.stage) params.set("stage", filters.stage);
  const query = params.toString();
  return query ? `/lineup?${query}` : "/lineup";
}

function Chip({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
        active
          ? "bg-violet-600 text-white"
          : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function LineupPage({ searchParams }: PageProps<"/lineup">) {
  await requireUser();
  const params = await searchParams;
  const filters: ShowFilters = { day: single(params.day), stage: single(params.stage) };

  const [shows, stages] = await Promise.all([listShows(filters), listStages()]);
  const days = festivalDays(festival);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Line-up</h1>

      <div className="mt-4 flex flex-col gap-2">
        <nav aria-label="Filtrar por día" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip href={filterHref({ stage: filters.stage })} active={!filters.day}>
            Todos los días
          </Chip>
          {days.map((day) => (
            <Chip key={day} href={filterHref({ ...filters, day })} active={filters.day === day}>
              {formatFestivalDay(day)}
            </Chip>
          ))}
        </nav>
        <nav aria-label="Filtrar por escenario" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip href={filterHref({ day: filters.day })} active={!filters.stage}>
            Todos los escenarios
          </Chip>
          {stages.map((stage) => (
            <Chip
              key={stage}
              href={filterHref({ ...filters, stage })}
              active={filters.stage === stage}
            >
              {stage}
            </Chip>
          ))}
        </nav>
      </div>

      {shows.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">
          No hay shows con estos filtros.
        </p>
      ) : (
        <ul aria-label="Shows" className="mt-4 flex flex-col gap-2">
          {shows.map((show) => (
            <li key={show.id}>
              <Link
                href={`/lineup/${show.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 transition hover:ring-violet-300"
              >
                <div className="w-14 shrink-0 text-center font-mono text-sm">
                  <div className="font-semibold">{formatFestivalTime(show.startsAt)}</div>
                  <div className="text-neutral-400">{formatFestivalTime(show.endsAt)}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{show.artist}</div>
                  <div className="truncate text-sm text-neutral-500">
                    <span className="capitalize">{formatFestivalDay(show.day)}</span> ·{" "}
                    {show.stage}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

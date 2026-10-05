import { FESTIVAL_TIME_ZONE } from "@/config/festival";

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;

const zoneParts = new Intl.DateTimeFormat("en-US", {
  timeZone: FESTIVAL_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Festival-zone wall time of an instant, as if it were UTC fields. */
function wallTimeAsUtcMs(instant: Date): number {
  const parts = Object.fromEntries(
    zoneParts.formatToParts(instant).map((p) => [p.type, Number(p.value)]),
  );
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

/**
 * Parses "YYYY-MM-DD HH:MM" as wall time in the festival zone and returns the
 * UTC instant, or null when the value is malformed or not a real date.
 */
export function festivalLocalToUtc(value: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (hour > 23 || minute > 59) return null;

  const wallMs = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(wallMs);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;

  // Shift by the zone offset; a second pass settles offset changes.
  let instant = wallMs;
  for (let i = 0; i < 2; i++) {
    instant = wallMs - (wallTimeAsUtcMs(new Date(instant)) - instant);
  }
  return new Date(instant);
}

const timeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: FESTIVAL_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "HH:MM" of an instant in the festival zone. */
export function formatFestivalTime(instant: Date): string {
  return timeFormat.format(instant);
}

const weekdayFormat = new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", weekday: "long" });

/** "sábado 21/11" for a YYYY-MM-DD festival day. */
export function formatFestivalDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  // A calendar date has no zone; format it at UTC midnight to keep it intact.
  const weekday = weekdayFormat.format(new Date(Date.UTC(y, m - 1, d)));
  return `${weekday} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

/** Every YYYY-MM-DD day from startDate to endDate, inclusive. */
export function festivalDays({ startDate, endDate }: { startDate: string; endDate: string }): string[] {
  const days: string[] = [];
  const [y, m, d] = startDate.split("-").map(Number);
  for (let i = 0; ; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
    if (day > endDate) return days;
    days.push(day);
  }
}

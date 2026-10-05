import { parse } from "csv-parse/sync";
import type { FestivalConfig } from "@/config/festival";
import { festivalLocalToUtc } from "@/lib/festival-time";

export type LineupShow = {
  /** Stable slug chosen by development; selections reference it. */
  id: string;
  artist: string;
  description: string;
  /** Festival day the show belongs to, even if it ends after midnight (RF-71). */
  day: string;
  stage: string;
  startsAt: Date;
  endsAt: Date;
};

export type ParseLineupResult =
  | { ok: true; shows: LineupShow[] }
  | { ok: false; errors: string[] };

const COLUMNS = ["id", "artist", "description", "day", "stage", "start", "end"] as const;
type Column = (typeof COLUMNS)[number];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === value;
}

function nextDate(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/**
 * Validates the whole line-up before anything is loaded (RF-04): any invalid
 * row rejects the file, and every problem is reported with its line.
 */
export function parseLineupCsv(text: string, festival: FestivalConfig): ParseLineupResult {
  let records: { record: string[]; info: { lines: number } }[];
  try {
    records = parse(text, { info: true, skip_empty_lines: true }) as unknown as typeof records;
  } catch (error) {
    return { ok: false, errors: [`invalid CSV: ${(error as Error).message}`] };
  }

  const [header, ...rows] = records;
  if (!header || header.record.map((c) => c.trim()).join(",") !== COLUMNS.join(",")) {
    return { ok: false, errors: [`header must be exactly: ${COLUMNS.join(",")}`] };
  }
  if (rows.length === 0) return { ok: false, errors: ["the CSV has no shows"] };

  const errors: string[] = [];
  const shows: LineupShow[] = [];
  const seenIds = new Set<string>();

  for (const { record, info } of rows) {
    const line = info.lines;
    const fail = (message: string) => errors.push(`line ${line}: ${message}`);
    const row = Object.fromEntries(COLUMNS.map((c, i) => [c, (record[i] ?? "").trim()])) as Record<
      Column,
      string
    >;

    const blank = COLUMNS.filter((c) => row[c] === "");
    blank.forEach((c) => fail(`${c} is required`));

    if (row.id && !SLUG.test(row.id)) fail("id must be a lowercase slug");
    else if (row.id && seenIds.has(row.id)) fail(`duplicate id "${row.id}"`);
    seenIds.add(row.id);

    if (
      row.day &&
      (!isRealDate(row.day) || row.day < festival.startDate || row.day > festival.endDate)
    ) {
      fail(
        `day must be a festival date between ${festival.startDate} and ${festival.endDate}`,
      );
    }

    const startsAt = row.start ? festivalLocalToUtc(row.start) : null;
    const endsAt = row.end ? festivalLocalToUtc(row.end) : null;
    if (row.start && !startsAt) fail('start must be "YYYY-MM-DD HH:MM"');
    if (row.end && !endsAt) fail('end must be "YYYY-MM-DD HH:MM"');
    if (startsAt && endsAt && endsAt <= startsAt) fail("end must be after start");

    // Guards against a wrong day: a show starts on its day or right after midnight.
    const startDate = row.start.slice(0, 10);
    if (startsAt && isRealDate(row.day) && startDate !== row.day && startDate !== nextDate(row.day)) {
      fail("start must fall on day or the following calendar date");
    }

    if (errors.length === 0 && startsAt && endsAt) {
      const { id, artist, description, day, stage } = row;
      shows.push({ id, artist, description, day, stage, startsAt, endsAt });
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, shows };
}

import { describe, expect, it } from "vitest";
import type { FestivalConfig } from "@/config/festival";
import { parseLineupCsv } from "./parse-lineup-csv";

const festival: FestivalConfig = {
  name: "Test Fest",
  city: "Buenos Aires",
  province: "Buenos Aires",
  startDate: "2026-11-20",
  endDate: "2026-11-22",
};

const HEADER = "id,artist,description,day,stage,start,end";
const ROW = {
  id: "the-band",
  artist: "The Band",
  description: "Rock",
  day: "2026-11-21",
  stage: "Norte",
  start: "2026-11-21 23:30",
  end: "2026-11-22 01:00",
};
type Row = typeof ROW;

const csv = (...rows: Partial<Row>[]) =>
  [
    HEADER,
    ...rows.map((r) => {
      const row = { ...ROW, ...r };
      return [row.id, row.artist, row.description, row.day, row.stage, row.start, row.end]
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(",");
    }),
  ].join("\n");

describe("parseLineupCsv", () => {
  it("parses a valid show into UTC instants", () => {
    const result = parseLineupCsv(csv({}), festival);

    expect(result).toEqual({
      ok: true,
      shows: [
        {
          id: "the-band",
          artist: "The Band",
          description: "Rock",
          day: "2026-11-21",
          stage: "Norte",
          startsAt: new Date("2026-11-22T02:30:00.000Z"),
          endsAt: new Date("2026-11-22T04:00:00.000Z"),
        },
      ],
    });
  });

  it("keeps the CSV day for a show ending after midnight (AC-04)", () => {
    const result = parseLineupCsv(csv({}), festival);

    expect(result.ok && result.shows[0].day).toBe("2026-11-21");
  });

  it("supports commas, quotes and line breaks in the description", () => {
    const description = 'Rock, pop y "algo más"\nen dos líneas';

    const result = parseLineupCsv(csv({ description }), festival);

    expect(result.ok && result.shows[0].description).toBe(description);
  });

  it("trims surrounding whitespace", () => {
    const result = parseLineupCsv(csv({ artist: "  The Band  " }), festival);

    expect(result.ok && result.shows[0].artist).toBe("The Band");
  });

  it.each(["id", "artist", "description", "day", "stage", "start", "end"] as const)(
    "rejects the whole file when %s is blank (AC-03)",
    (field) => {
      const result = parseLineupCsv(csv({ id: "ok-show" }, { id: "bad", [field]: " " }), festival);

      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors).toContainEqual(
        expect.stringMatching(new RegExp(`line 3: ${field} is required`)),
      );
    },
  );

  it("rejects an id that is not a lowercase slug", () => {
    const result = parseLineupCsv(csv({ id: "The Band" }), festival);

    expect(!result.ok && result.errors).toEqual(["line 2: id must be a lowercase slug"]);
  });

  it("rejects duplicate ids", () => {
    const result = parseLineupCsv(csv({}, {}), festival);

    expect(!result.ok && result.errors).toEqual(['line 3: duplicate id "the-band"']);
  });

  it.each(["2026-11-19", "2026-11-23", "2026-13-01"])(
    "rejects the day %s outside the festival",
    (day) => {
      const result = parseLineupCsv(csv({ day }), festival);

      expect(!result.ok && result.errors).toContainEqual(
        "line 2: day must be a festival date between 2026-11-20 and 2026-11-22",
      );
    },
  );

  it("rejects a malformed time", () => {
    const result = parseLineupCsv(csv({ start: "23:30" }), festival);

    expect(!result.ok && result.errors).toContainEqual(
      'line 2: start must be "YYYY-MM-DD HH:MM"',
    );
  });

  it("rejects a show that does not end after it starts", () => {
    const result = parseLineupCsv(
      csv({ start: "2026-11-21 22:00", end: "2026-11-21 22:00" }),
      festival,
    );

    expect(!result.ok && result.errors).toEqual(["line 2: end must be after start"]);
  });

  it("rejects a start that is not on its day or the early hours after it", () => {
    const result = parseLineupCsv(
      csv({ start: "2026-11-20 22:00", end: "2026-11-20 23:00" }),
      festival,
    );

    expect(!result.ok && result.errors).toEqual([
      "line 2: start must fall on day or the following calendar date",
    ]);
  });

  it("rejects a file with missing or unexpected columns", () => {
    const result = parseLineupCsv("id,artist,day\nx,y,2026-11-21", festival);

    expect(result).toEqual({
      ok: false,
      errors: ["header must be exactly: id,artist,description,day,stage,start,end"],
    });
  });

  it("rejects an empty line-up", () => {
    expect(parseLineupCsv(HEADER, festival)).toEqual({
      ok: false,
      errors: ["the CSV has no shows"],
    });
  });

  it("reports every error, not just the first", () => {
    const result = parseLineupCsv(csv({ stage: "" }, { id: "other", artist: "" }), festival);

    expect(!result.ok && result.errors).toHaveLength(2);
  });
});

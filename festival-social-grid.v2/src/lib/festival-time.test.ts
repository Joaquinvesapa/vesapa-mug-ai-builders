import { describe, expect, it } from "vitest";
import {
  festivalDays,
  festivalLocalToUtc,
  formatFestivalDay,
  formatFestivalTime,
} from "./festival-time";

describe("festivalLocalToUtc", () => {
  it("converts Buenos Aires wall time to the UTC instant", () => {
    expect(festivalLocalToUtc("2026-11-21 23:30")?.toISOString()).toBe(
      "2026-11-22T02:30:00.000Z",
    );
  });

  it("handles times after midnight", () => {
    expect(festivalLocalToUtc("2026-11-22 01:00")?.toISOString()).toBe(
      "2026-11-22T04:00:00.000Z",
    );
  });

  it("does not depend on the server time zone", () => {
    // The process TZ is irrelevant; the zone is fixed by the festival.
    const original = process.env.TZ;
    process.env.TZ = "Asia/Tokyo";
    try {
      expect(festivalLocalToUtc("2026-11-21 12:00")?.toISOString()).toBe(
        "2026-11-21T15:00:00.000Z",
      );
    } finally {
      process.env.TZ = original;
    }
  });

  it.each(["2026-11-21T23:30", "2026-11-21 24:00", "2026-02-30 10:00", "21/11/2026 10:00", ""])(
    "rejects the malformed value %j",
    (value) => {
      expect(festivalLocalToUtc(value)).toBeNull();
    },
  );
});

describe("festival display formatting", () => {
  it("formats the start and end time in the festival zone", () => {
    expect(formatFestivalTime(new Date("2026-11-22T04:00:00.000Z"))).toBe("01:00");
  });

  it("formats a festival day with its weekday", () => {
    expect(formatFestivalDay("2026-11-21")).toBe("sábado 21/11");
  });

  it("lists every day of the festival", () => {
    expect(festivalDays({ startDate: "2026-11-30", endDate: "2026-12-02" })).toEqual([
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
    ]);
  });
});

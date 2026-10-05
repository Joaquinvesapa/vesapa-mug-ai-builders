import { describe, expect, it } from "vitest";
import { festivalLocalToUtc } from "./festival-time";

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

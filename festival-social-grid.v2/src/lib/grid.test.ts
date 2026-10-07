import { describe, expect, it } from "vitest";
import { findOverlaps, groupByDay } from "./grid";

const show = (id: string, day: string, start: string, end: string) => ({
  id,
  artist: id.toUpperCase(),
  day,
  startsAt: new Date(start),
  endsAt: new Date(end),
});

describe("findOverlaps", () => {
  it("names both shows of an overlapping pair (AC-41)", () => {
    const a = show("a", "2027-03-05", "2027-03-05T23:00Z", "2027-03-06T00:00Z");
    const b = show("b", "2027-03-05", "2027-03-05T23:30Z", "2027-03-06T00:30Z");

    expect(findOverlaps([a, b])).toEqual([[a, b]]);
  });

  it("does not warn when one ends exactly as the other starts (AC-42)", () => {
    const a = show("a", "2027-03-05", "2027-03-05T22:00Z", "2027-03-05T23:00Z");
    const b = show("b", "2027-03-05", "2027-03-05T23:00Z", "2027-03-06T00:00Z");

    expect(findOverlaps([a, b])).toEqual([]);
  });

  it("detects a show fully inside another", () => {
    const a = show("a", "2027-03-05", "2027-03-05T20:00Z", "2027-03-05T23:00Z");
    const b = show("b", "2027-03-05", "2027-03-05T21:00Z", "2027-03-05T22:00Z");

    expect(findOverlaps([b, a])).toEqual([[a, b]]);
  });

  it("detects an after-midnight show overlapping the next day's first show", () => {
    const late = show("late", "2027-03-05", "2027-03-06T02:30Z", "2027-03-06T04:00Z");
    const early = show("early", "2027-03-06", "2027-03-06T03:00Z", "2027-03-06T05:00Z");

    expect(findOverlaps([early, late])).toEqual([[late, early]]);
  });

  it("reports every overlapping pair", () => {
    const a = show("a", "d", "2027-03-05T20:00Z", "2027-03-05T23:00Z");
    const b = show("b", "d", "2027-03-05T21:00Z", "2027-03-05T22:00Z");
    const c = show("c", "d", "2027-03-05T21:30Z", "2027-03-05T22:30Z");

    expect(findOverlaps([a, b, c]).map(([x, y]) => [x.id, y.id])).toEqual([
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
    ]);
  });
});

describe("groupByDay", () => {
  it("groups 2 shows of day 1 and 1 of day 2 into 2 sections (AC-40)", () => {
    const a = show("a", "2027-03-05", "2027-03-05T20:00Z", "2027-03-05T21:00Z");
    const b = show("b", "2027-03-05", "2027-03-05T22:00Z", "2027-03-05T23:00Z");
    const c = show("c", "2027-03-06", "2027-03-06T20:00Z", "2027-03-06T21:00Z");

    expect(groupByDay([a, b, c])).toEqual([
      { day: "2027-03-05", shows: [a, b] },
      { day: "2027-03-06", shows: [c] },
    ]);
  });
});

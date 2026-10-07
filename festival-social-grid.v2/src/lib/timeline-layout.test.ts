import { describe, expect, it } from "vitest";
import { EXPORT_SIZES, layoutDayTimeline } from "./timeline-layout";

const STAGES = ["Alternative Stage", "Flow Stage", "Kidzapalooza", "Perry's Stage", "Samsung Stage"];

// Times are UTC; Buenos Aires is UTC-3, so 17:30Z is 14:30 local.
const show = (id: string, stage: string, start: string, end: string) => ({
  id,
  artist: id,
  stage,
  startsAt: new Date(`2027-03-05T${start}:00Z`),
  endsAt: new Date(`2027-03-05T${end}:00Z`),
});

describe("EXPORT_SIZES", () => {
  it("offers exactly 1080 × 1920 and 1080 × 1350 (RF-62, RF-63)", () => {
    expect(EXPORT_SIZES).toEqual({
      story: { width: 1080, height: 1920 },
      portrait: { width: 1080, height: 1350 },
    });
  });
});

describe("layoutDayTimeline", () => {
  const tiger = show("Tiger Mood", "Flow Stage", "17:30", "18:15");
  const mora = show("Mora Fisz", "Samsung Stage", "16:45", "17:30");

  it("has one column per stage, in order, including stages without shows", () => {
    const layout = layoutDayTimeline([tiger], STAGES, "story");

    expect(layout.columns.map((c) => c.stage)).toEqual(STAGES);
  });

  it("places exactly the given shows in their stage column (AC-89)", () => {
    const layout = layoutDayTimeline([tiger, mora], STAGES, "story");

    expect(layout.blocks.map((b) => b.show.id).sort()).toEqual(["Mora Fisz", "Tiger Mood"]);
    for (const block of layout.blocks) {
      const column = layout.columns.find((c) => c.stage === block.show.stage)!;
      expect(block.x).toBe(column.x);
      expect(block.width).toBe(column.width);
    }
  });

  it("spans whole hours from the first start to the last end, in festival time", () => {
    const layout = layoutDayTimeline([tiger, mora], STAGES, "story");

    // Mora starts 13:45 local and Tiger ends 15:15 local: axis 13:00 → 16:00.
    expect(layout.hours.map((h) => h.label)).toEqual(["13:00", "14:00", "15:00", "16:00"]);
  });

  it("sizes each block in proportion to its duration and start (time slot)", () => {
    const layout = layoutDayTimeline([tiger, mora], STAGES, "story");
    const hourHeight = layout.hours[1].y - layout.hours[0].y;
    const tigerBlock = layout.blocks.find((b) => b.show.id === "Tiger Mood")!;

    expect(tigerBlock.y).toBeCloseTo(layout.hours[0].y + 1.5 * hourHeight);
    expect(tigerBlock.height).toBeCloseTo(0.75 * hourHeight);
  });

  it("keeps touching shows from overlapping vertically", () => {
    const layout = layoutDayTimeline([mora, tiger], STAGES, "story");
    const moraBlock = layout.blocks.find((b) => b.show.id === "Mora Fisz")!;
    const tigerBlock = layout.blocks.find((b) => b.show.id === "Tiger Mood")!;

    expect(moraBlock.y + moraBlock.height).toBeLessThanOrEqual(tigerBlock.y + 0.001);
  });

  it("supports a day that ends after midnight", () => {
    const late = show("Peggy Gou", "Samsung Stage", "02:30", "04:00");
    late.startsAt = new Date("2027-03-06T02:30:00Z");
    late.endsAt = new Date("2027-03-06T04:00:00Z");

    const layout = layoutDayTimeline([late], STAGES, "portrait");

    expect(layout.hours.map((h) => h.label)).toEqual(["23:00", "00:00", "01:00"]);
  });

  it("includes all 10 shows of a busy day inside the image (AC-95)", () => {
    // 10 shows from 14:00 to 00:45 local, one per hour, across every stage.
    const shows = Array.from({ length: 10 }, (_, i) => {
      const s = show(`s${i}`, STAGES[i % 5], "17:00", "17:45");
      s.startsAt = new Date(s.startsAt.getTime() + i * 3_600_000);
      s.endsAt = new Date(s.endsAt.getTime() + i * 3_600_000);
      return s;
    });

    for (const size of ["story", "portrait"] as const) {
      const layout = layoutDayTimeline(shows, STAGES, size);
      expect(layout.blocks).toHaveLength(10);
      for (const block of layout.blocks) {
        expect(block.y).toBeGreaterThanOrEqual(0);
        expect(block.y + block.height).toBeLessThanOrEqual(EXPORT_SIZES[size].height);
      }
    }
  });
});

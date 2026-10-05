import { describe, expect, it } from "vitest";
import {
  FESTIVAL_TIME_ZONE,
  festival,
  parseFestivalConfig,
  type FestivalConfig,
} from "./festival";

const valid: FestivalConfig = {
  name: "Festival de prueba",
  city: "Buenos Aires",
  province: "Buenos Aires",
  startDate: "2026-11-20",
  endDate: "2026-11-22",
};

describe("festival config", () => {
  it("uses the fixed Argentina time zone", () => {
    expect(FESTIVAL_TIME_ZONE).toBe("America/Argentina/Buenos_Aires");
  });

  it("accepts a complete config", () => {
    expect(parseFestivalConfig(valid)).toEqual(valid);
  });

  it("accepts a single-day festival", () => {
    const oneDay = { ...valid, endDate: valid.startDate };
    expect(parseFestivalConfig(oneDay)).toEqual(oneDay);
  });

  it.each(["name", "city", "province"] as const)(
    "rejects a blank %s",
    (field) => {
      expect(() => parseFestivalConfig({ ...valid, [field]: "  " })).toThrow(
        field,
      );
    },
  );

  it.each(["2026-13-01", "2026-02-30", "20/11/2026", ""])(
    "rejects the invalid date %j",
    (date) => {
      expect(() => parseFestivalConfig({ ...valid, startDate: date })).toThrow(
        "startDate",
      );
    },
  );

  it("rejects an end date before the start date", () => {
    expect(() =>
      parseFestivalConfig({ ...valid, endDate: "2026-11-19" }),
    ).toThrow("endDate");
  });

  it("ships a valid config for this deployment", () => {
    expect(() => parseFestivalConfig(festival)).not.toThrow();
  });
});

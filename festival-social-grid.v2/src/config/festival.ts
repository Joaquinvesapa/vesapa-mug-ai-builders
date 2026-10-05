/**
 * The single festival of this deployment (RF-01, RF-02). Edited by
 * development only; there is no UI to manage festivals.
 */

/** Fixed zone for every festival time comparison, regardless of server or device. */
export const FESTIVAL_TIME_ZONE = "America/Argentina/Buenos_Aires";

export type FestivalConfig = {
  name: string;
  city: string;
  /** Argentine province; every festival is in Argentina. */
  province: string;
  /** First festival day, as YYYY-MM-DD in FESTIVAL_TIME_ZONE. */
  startDate: string;
  /** Last festival day, as YYYY-MM-DD in FESTIVAL_TIME_ZONE. */
  endDate: string;
};

function requireText(value: string, field: keyof FestivalConfig): void {
  if (value.trim() === "") {
    throw new Error(`Invalid festival config: ${field} must not be blank`);
  }
}

function requireDate(value: string, field: keyof FestivalConfig): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const [year, month, day] = match ? match.slice(1).map(Number) : [];
  const date = match ? new Date(Date.UTC(year, month - 1, day)) : null;
  // Round-tripping rejects calendar overflows such as 2026-02-30.
  if (!date || date.toISOString().slice(0, 10) !== value) {
    throw new Error(
      `Invalid festival config: ${field} must be a YYYY-MM-DD date`,
    );
  }
}

export function parseFestivalConfig(config: FestivalConfig): FestivalConfig {
  requireText(config.name, "name");
  requireText(config.city, "city");
  requireText(config.province, "province");
  requireDate(config.startDate, "startDate");
  requireDate(config.endDate, "endDate");
  if (config.endDate < config.startDate) {
    throw new Error(
      "Invalid festival config: endDate must not be before startDate",
    );
  }
  return config;
}

// Placeholder values until the real festival is provided.
export const festival: FestivalConfig = parseFestivalConfig({
  name: "Festival de ejemplo",
  city: "Ciudad Autónoma de Buenos Aires",
  province: "Ciudad Autónoma de Buenos Aires",
  startDate: "2026-11-20",
  endDate: "2026-11-22",
});

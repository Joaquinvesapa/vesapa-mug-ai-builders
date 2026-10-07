type Interval = { startsAt: Date; endsAt: Date };

function byStart<T extends Interval>(a: T, b: T): number {
  return a.startsAt.getTime() - b.startsAt.getTime() || a.endsAt.getTime() - b.endsAt.getTime();
}

/**
 * Every pair of shows whose intervals overlap (RF-27), earliest first.
 * Touching edges (one ends exactly when the other starts) do not overlap (AC-42).
 */
export function findOverlaps<T extends Interval>(shows: T[]): [T, T][] {
  const sorted = [...shows].sort(byStart);
  const pairs: [T, T][] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      // Sorted by start: once a show starts at or after i ends, none later overlap.
      if (sorted[j].startsAt >= sorted[i].endsAt) break;
      pairs.push([sorted[i], sorted[j]]);
    }
  }
  return pairs;
}

/** Shows grouped by festival day, keeping their order (RF-26). */
export function groupByDay<T extends { day: string }>(shows: T[]): { day: string; shows: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const show of shows) {
    groups.set(show.day, [...(groups.get(show.day) ?? []), show]);
  }
  return [...groups].map(([day, dayShows]) => ({ day, shows: dayShows }));
}

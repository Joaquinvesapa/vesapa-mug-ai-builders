import { formatFestivalTime } from "./festival-time";

/** PNG export formats (RF-62, RF-63). */
export const EXPORT_SIZES = {
  story: { width: 1080, height: 1920 },
  portrait: { width: 1080, height: 1350 },
} as const;

export type ExportSize = keyof typeof EXPORT_SIZES;

export function isExportSize(value: string): value is ExportSize {
  return Object.hasOwn(EXPORT_SIZES, value);
}

type TimelineShow = { id: string; artist: string; stage: string; startsAt: Date; endsAt: Date };

export type TimelineLayout<T extends TimelineShow> = {
  width: number;
  height: number;
  /** Area for the title above the table. */
  header: { height: number };
  columns: { stage: string; x: number; width: number }[];
  /** Stage names row. */
  stageRow: { y: number; height: number };
  /** Gutter with the hour labels, left of the columns. */
  gutter: { width: number };
  hours: { label: string; y: number }[];
  blocks: { show: T; x: number; y: number; width: number; height: number }[];
};

const PADDING = 40;
const HEADER_HEIGHT = 130;
const STAGE_ROW_HEIGHT = 80;
const GUTTER_WIDTH = 90;
const COLUMN_GAP = 8;
const HOUR_MS = 3_600_000;

/**
 * Lays out one festival day as a time × stage table, like the official
 * poster: every stage is a column and each show a block sized by its time
 * slot (RF-57). Every show always fits (RF-64): hours stretch to the space.
 * Buenos Aires has whole-hour offsets, so UTC hour boundaries are local ones.
 */
export function layoutDayTimeline<T extends TimelineShow>(
  shows: T[],
  stages: string[],
  size: ExportSize,
): TimelineLayout<T> {
  const { width, height } = EXPORT_SIZES[size];

  const first = Math.min(...shows.map((s) => s.startsAt.getTime()));
  const last = Math.max(...shows.map((s) => s.endsAt.getTime()));
  const axisStart = Math.floor(first / HOUR_MS) * HOUR_MS;
  const axisEnd = Math.ceil(last / HOUR_MS) * HOUR_MS;
  const hourCount = Math.max(1, (axisEnd - axisStart) / HOUR_MS);

  const bodyTop = PADDING + HEADER_HEIGHT + STAGE_ROW_HEIGHT;
  const bodyHeight = height - bodyTop - PADDING;
  const hourHeight = bodyHeight / hourCount;
  const yFor = (ms: number) => bodyTop + ((ms - axisStart) / HOUR_MS) * hourHeight;

  const tableLeft = PADDING + GUTTER_WIDTH;
  const tableWidth = width - tableLeft - PADDING;
  const columnWidth = (tableWidth - COLUMN_GAP * (stages.length - 1)) / stages.length;
  const columns = stages.map((stage, i) => ({
    stage,
    x: tableLeft + i * (columnWidth + COLUMN_GAP),
    width: columnWidth,
  }));
  const columnOf = new Map(columns.map((c) => [c.stage, c]));

  const hours = Array.from({ length: hourCount + 1 }, (_, i) => {
    const ms = axisStart + i * HOUR_MS;
    return { label: formatFestivalTime(new Date(ms)), y: yFor(ms) };
  });

  const blocks = shows.flatMap((show) => {
    const column = columnOf.get(show.stage);
    if (!column) return [];
    const top = yFor(show.startsAt.getTime());
    return [
      {
        show,
        x: column.x,
        y: top,
        width: column.width,
        height: yFor(show.endsAt.getTime()) - top,
      },
    ];
  });

  return {
    width,
    height,
    header: { height: HEADER_HEIGHT },
    columns,
    stageRow: { y: PADDING + HEADER_HEIGHT, height: STAGE_ROW_HEIGHT },
    gutter: { width: GUTTER_WIDTH },
    hours,
    blocks,
  };
}

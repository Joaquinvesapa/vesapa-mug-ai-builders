import { ImageResponse } from "next/og";
import { festival } from "@/config/festival";
import { festivalDays, formatFestivalDay, formatFestivalTime } from "@/lib/festival-time";
import { EXPORT_SIZES, isExportSize, layoutDayTimeline } from "@/lib/timeline-layout";
import { getCurrentUser } from "@/server/auth/current-user";
import { listSelectedShows } from "@/server/grid/selections";
import { listStages } from "@/server/lineup/queries";

const VIOLET = "#7c3aed";
const NEUTRAL_100 = "#f5f5f5";
const NEUTRAL_200 = "#e5e5e5";
const NEUTRAL_500 = "#737373";
const NEUTRAL_900 = "#171717";

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * PNG of one day of the signed-in person's grid (RF-57). The owner always
 * comes from the session, so nobody can export someone else's grid (RF-69).
 */
export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user?.username) return new Response("Unauthorized", { status: 401 });

  const params = new URL(request.url).searchParams;
  const day = params.get("day") ?? "";
  const size = params.get("size") ?? "";
  if (!festivalDays(festival).includes(day) || !isExportSize(size)) {
    return new Response("Invalid day or size", { status: 400 });
  }

  const [selected, stages] = await Promise.all([listSelectedShows(user.id), listStages()]);
  const shows = selected.filter((s) => s.day === day);
  if (shows.length === 0) return new Response("No shows selected on this day", { status: 404 });

  const layout = layoutDayTimeline(shows, stages, size);
  const { width, height } = EXPORT_SIZES[size];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: NEUTRAL_100,
          color: NEUTRAL_900,
        }}
      >
        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 40,
            right: 40,
            height: layout.header.height,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 28, color: VIOLET }}>{festival.name}</div>
          <div style={{ fontSize: 52 }}>{`Mi grilla · ${sentenceCase(formatFestivalDay(day))}`}</div>
        </div>

        {/* Hour lines and labels */}
        {layout.hours.map((hour) => (
          <div
            key={hour.label + hour.y}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: hour.y,
              height: 2,
              backgroundColor: NEUTRAL_200,
            }}
          />
        ))}
        {layout.hours.map((hour) => (
          <div
            key={`label-${hour.label}-${hour.y}`}
            style={{
              position: "absolute",
              left: 40,
              top: hour.y + 4,
              width: layout.gutter.width - 12,
              fontSize: 22,
              color: NEUTRAL_500,
            }}
          >
            {hour.label}
          </div>
        ))}

        {/* Stage header row */}
        {layout.columns.map((column) => (
          <div
            key={column.stage}
            style={{
              position: "absolute",
              left: column.x,
              top: layout.stageRow.y,
              width: column.width,
              height: layout.stageRow.height - 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: 14,
              backgroundColor: VIOLET,
              color: "white",
              fontSize: 20,
              padding: "0 8px",
            }}
          >
            {column.stage}
          </div>
        ))}

        {/* Show blocks */}
        {layout.blocks.map(({ show, x, y, width: w, height: h }) => {
          // Short blocks (≈45 min in 1080 × 1350) get one line per field so
          // the artist and the time never overlap.
          const compact = h < 90;
          return (
            <div
              key={show.id}
              style={{
                position: "absolute",
                left: x,
                top: y + 3,
                width: w,
                height: h - 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                overflow: "hidden",
                borderRadius: 14,
                backgroundColor: "white",
                border: `2px solid ${NEUTRAL_200}`,
                padding: "2px 8px",
              }}
            >
              <div
                style={{
                  fontSize: compact ? 18 : 22,
                  lineHeight: 1.1,
                  maxWidth: "100%",
                  ...(compact
                    ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                    : {}),
                }}
              >
                {show.artist}
              </div>
              <div style={{ fontSize: compact ? 15 : 18, color: NEUTRAL_500, marginTop: compact ? 2 : 4 }}>
                {`${formatFestivalTime(show.startsAt)} – ${formatFestivalTime(show.endsAt)}`}
              </div>
            </div>
          );
        })}
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Content-Disposition": `attachment; filename="mi-grilla-${day}.png"`,
        // Personal content: never store it in shared caches.
        "Cache-Control": "private, no-store",
      },
    },
  );
}

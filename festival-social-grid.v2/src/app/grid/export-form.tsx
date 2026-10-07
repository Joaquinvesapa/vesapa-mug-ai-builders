import { formatFestivalDay } from "@/lib/festival-time";

const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const selectClass =
  "h-12 rounded-xl border border-neutral-300 bg-white px-3 text-base outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

/** Downloads one day of the grid as PNG; a plain GET works without JavaScript. */
export function ExportForm({ days }: { days: string[] }) {
  return (
    <form
      action="/grid/export"
      method="get"
      className="mt-8 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200"
    >
      <h2 className="font-medium">Compartir mi grilla</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="export-day" className="text-sm font-medium text-neutral-700">
            Día
          </label>
          <select id="export-day" name="day" className={selectClass}>
            {days.map((day) => (
              <option key={day} value={day}>
                {sentenceCase(formatFestivalDay(day))}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="export-size" className="text-sm font-medium text-neutral-700">
            Formato
          </label>
          <select id="export-size" name="size" className={selectClass}>
            <option value="story">Historia 9:16</option>
            <option value="portrait">Post 4:5</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="flex h-12 items-center justify-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700"
      >
        Descargar PNG
      </button>
    </form>
  );
}

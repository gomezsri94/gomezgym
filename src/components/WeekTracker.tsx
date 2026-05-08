import { useLogs, formatDateISO } from "@/lib/gym-store";

export function WeekTracker() {
  const { logs } = useLogs();
  const trainedDates = new Set(logs.map((l) => l.date));

  // Build Mon..Sun for the current week (Mon as start)
  const today = new Date();
  const dow = today.getDay(); // 0=Sun..6=Sat
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + offsetToMonday);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayISO = formatDateISO(today);

  return (
    <section className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">This week</h2>
        <span className="text-xs text-muted-foreground">
          {days.filter((d) => trainedDates.has(formatDateISO(d))).length}/7 trained
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const iso = formatDateISO(d);
          const trained = trainedDates.has(iso);
          const isToday = iso === todayISO;
          return (
            <div key={iso} className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  "aspect-square w-full rounded-md border transition",
                  trained
                    ? "border-primary bg-primary/80"
                    : "border-border bg-muted",
                  isToday ? "ring-2 ring-primary/60" : "",
                ].join(" ")}
                aria-label={`${labels[i]} ${trained ? "trained" : "not trained"}`}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

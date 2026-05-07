import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Calendar } from "@/components/ui/calendar";
import { useExercises, useLogs, formatDateISO } from "@/lib/gym-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — IronLog" },
      { name: "description", content: "See your training calendar and progress." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { logs } = useLogs();
  const { exercises } = useExercises();
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const trainedDays = useMemo(() => {
    const set = new Set(logs.map((l) => l.date));
    return Array.from(set).map((d) => new Date(d + "T00:00:00"));
  }, [logs]);

  const selectedISO = selected ? formatDateISO(selected) : "";
  const dayLogs = logs.filter((l) => l.date === selectedISO);
  const exMap = new Map(exercises.map((e) => [e.id, e]));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Training Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {trainedDays.length} day{trainedDays.length === 1 ? "" : "s"} of training logged.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="rounded-2xl border border-border bg-card p-2">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={{ trained: trainedDays }}
              modifiersClassNames={{
                trained:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {selected
                ? selected.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a day"}
            </h2>
            <ul className="mt-3 space-y-2">
              {dayLogs.map((log) => {
                const ex = exMap.get(log.exerciseId);
                return (
                  <li key={log.id}>
                    <Link
                      to="/exercise/$id"
                      params={{ id: log.exerciseId }}
                      className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
                    >
                      <div className="font-semibold">{ex?.name ?? "Deleted exercise"}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {log.sets.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums"
                          >
                            {s.reps} × {s.kg}kg{s.seconds ? ` · ${s.seconds}s` : ""}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </li>
                );
              })}
              {dayLogs.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No training logged on this day.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Calendar } from "@/components/ui/calendar";
import { useExercises, useLogs, formatDateISO } from "@/lib/gym-store";
import { useFoods, useFoodLogs } from "@/lib/food-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — GomezTracker" },
      { name: "description", content: "See your training and food calendar." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { logs } = useLogs();
  const { exercises } = useExercises();
  const { logs: foodLogs } = useFoodLogs();
  const { foods } = useFoods();
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const trainedDays = useMemo(
    () => Array.from(new Set(logs.map((l) => l.date))).map((d) => new Date(d + "T00:00:00")),
    [logs],
  );
  const foodDays = useMemo(
    () => Array.from(new Set(foodLogs.map((l) => l.date))).map((d) => new Date(d + "T00:00:00")),
    [foodLogs],
  );

  const selectedISO = selected ? formatDateISO(selected) : "";
  const dayLogs = logs.filter((l) => l.date === selectedISO);
  const dayFoodLogs = foodLogs.filter((l) => l.date === selectedISO);
  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const foodMap = new Map(foods.map((f) => [f.id, f]));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {trainedDays.length} training day{trainedDays.length === 1 ? "" : "s"} ·{" "}
          {foodDays.length} food day{foodDays.length === 1 ? "" : "s"} logged.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="rounded-2xl border border-border bg-card p-2">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={{ trained: trainedDays, food: foodDays }}
              modifiersClassNames={{
                trained:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-ml-2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
                food: "relative before:absolute before:bottom-1 before:left-1/2 before:ml-1 before:h-1 before:w-1 before:rounded-full before:bg-emerald-500",
              }}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="mt-2 flex items-center gap-3 px-2 pb-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Training
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Food
              </span>
            </div>
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

            <h3 className="mt-4 text-sm font-semibold text-muted-foreground">Training</h3>
            <ul className="mt-2 space-y-2">
              {dayLogs.map((log) => {
                const ex = exMap.get(log.exerciseId);
                return (
                  <li key={log.id}>
                    <Link
                      to="/exercise/$id"
                      params={{ id: log.exerciseId }}
                      className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{ex?.name ?? "Deleted exercise"}</div>
                        {log.time && (
                          <span className="text-xs text-muted-foreground tabular-nums">{log.time}</span>
                        )}
                      </div>
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
                <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No training logged.
                </li>
              )}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-muted-foreground">Food</h3>
            <ul className="mt-2 space-y-2">
              {Array.from(
                dayFoodLogs.reduce((map, log) => {
                  const arr = map.get(log.foodId) ?? [];
                  arr.push(log);
                  map.set(log.foodId, arr);
                  return map;
                }, new Map<string, typeof dayFoodLogs>()).entries(),
              ).map(([foodId, group]) => {
                const food = foodMap.get(foodId);
                const totalQty = group.reduce((s, l) => s + (l.quantity || 0), 0);
                const totalGrams = group.reduce((s, l) => s + (l.grams || l.amount || 0), 0);
                const totalCals = group.reduce((s, l) => s + (l.calories || 0), 0);
                const brands = Array.from(new Set(group.map((l) => l.brand).filter(Boolean))) as string[];
                return (
                  <li key={foodId}>
                    <Link
                      to="/food/$id"
                      params={{ id: foodId }}
                      className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{food?.name ?? "Deleted food"}</div>
                        {group.length > 1 && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            ×{group.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                          Qty {totalQty}
                        </span>
                        {brands.map((b) => (
                          <span key={b} className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                            {b}
                          </span>
                        ))}
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                          {totalGrams}g
                        </span>
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                          {totalCals} kcal
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
              {dayFoodLogs.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No food logged.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

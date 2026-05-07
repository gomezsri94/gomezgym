import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExercise, useLogs, todayISO } from "@/lib/gym-store";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/exercise/$id")({
  component: ExercisePage,
});

function ExercisePage() {
  const { id } = Route.useParams();
  const exercise = useExercise(id);
  const { logs, addLog, removeLog } = useLogs();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [sets, setSets] = useState<{ reps: string; kg: string }[]>([
    { reps: "", kg: "" },
  ]);

  const exerciseLogs = useMemo(
    () =>
      logs
        .filter((l) => l.exerciseId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [logs, id],
  );

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-muted-foreground">Exercise not found.</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">
            Back to list
          </Link>
        </main>
      </div>
    );
  }

  const handleSave = () => {
    const parsed = sets
      .map((s) => ({ reps: Number(s.reps), kg: Number(s.kg) }))
      .filter((s) => s.reps > 0);
    if (parsed.length === 0) return;
    addLog({ exerciseId: id, date, sets: parsed });
    setSets([{ reps: "", kg: "" }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-3xl font-bold tracking-tight">{exercise.name}</h1>
        {exercise.muscle && (
          <p className="mt-1 text-sm text-muted-foreground">{exercise.muscle}</p>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Log a session</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-[180px_1fr]">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-[40px_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span />
            </div>
            {sets.map((s, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_1fr_auto] items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={s.reps}
                  onChange={(e) =>
                    setSets((prev) => prev.map((p, idx) => (idx === i ? { ...p, reps: e.target.value } : p)))
                  }
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="0"
                  value={s.kg}
                  onChange={(e) =>
                    setSets((prev) => prev.map((p, idx) => (idx === i ? { ...p, kg: e.target.value } : p)))
                  }
                />
                <button
                  onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={sets.length === 1}
                  className="rounded-md p-2 text-muted-foreground transition hover:text-destructive disabled:opacity-30"
                  aria-label="Remove set"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setSets((p) => [...p, { reps: "", kg: "" }])}
            >
              <Plus className="h-4 w-4" /> Add set
            </Button>
            <Button variant="hero" onClick={handleSave} className="ml-auto">
              <Save className="h-4 w-4" /> Save session
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">History</h2>
          <ul className="mt-3 space-y-2">
            {exerciseLogs.map((log) => {
              const total = log.sets.reduce((acc, s) => acc + s.reps * s.kg, 0);
              return (
                <li
                  key={log.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <button
                      onClick={() => removeLog(log.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {log.sets.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums"
                      >
                        {s.reps} × {s.kg}kg
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Volume: {total.toLocaleString()} kg
                  </div>
                </li>
              );
            })}
            {exerciseLogs.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No sessions logged yet.
              </li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

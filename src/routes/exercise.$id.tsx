import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExercise, useExercises, useLogs, todayISO } from "@/lib/gym-store";
import { ArrowLeft, ImagePlus, Plus, Trash2, Save, X } from "lucide-react";

export const Route = createFileRoute("/exercise/$id")({
  component: ExercisePage,
});

function ExercisePage() {
  const { id } = Route.useParams();
  const exercise = useExercise(id);
  const { updateExercise } = useExercises();
  const { logs, addLog, removeLog } = useLogs();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1024;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        updateExercise(id, { image: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [sets, setSets] = useState<{ reps: string; kg: string; seconds: string }[]>([
    { reps: "", kg: "", seconds: "" },
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
      .map((s) => {
        const secs = Number(s.seconds);
        return {
          reps: Number(s.reps),
          kg: Number(s.kg),
          ...(secs > 0 ? { seconds: secs } : {}),
        };
      })
      .filter((s) => s.reps > 0 || (s.seconds ?? 0) > 0);
    if (parsed.length === 0) return;
    addLog({ exerciseId: id, date, time, sets: parsed });
    setSets([{ reps: "", kg: "", seconds: "" }]);
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

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {exercise.image ? (
            <div className="relative">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="max-h-[70vh] w-full object-contain bg-muted"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur transition hover:bg-background"
                >
                  Change
                </button>
                <button
                  onClick={() => updateExercise(id, { image: undefined })}
                  className="rounded-md bg-background/80 p-1.5 backdrop-blur transition hover:bg-background"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-32 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <ImagePlus className="h-6 w-6" />
              Add a photo for this exercise
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImage(f);
              e.target.value = "";
            }}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Log a session</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-[180px_140px_1fr]">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-[32px_1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
              <span>#</span>
              <span>Reps</span>
              <span>Kg</span>
              <span>Time (s)</span>
              <span />
            </div>
            {sets.map((s, i) => (
              <div key={i} className="grid grid-cols-[32px_1fr_1fr_1fr_auto] items-center gap-2">
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
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={s.seconds}
                  onChange={(e) =>
                    setSets((prev) => prev.map((p, idx) => (idx === i ? { ...p, seconds: e.target.value } : p)))
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
              onClick={() => setSets((p) => [...p, { reps: "", kg: "", seconds: "" }])}
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
                        {s.reps} × {s.kg}kg{s.seconds ? ` · ${s.seconds}s` : ""}
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

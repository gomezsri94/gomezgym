import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { RestTimer } from "@/components/RestTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExercises, useLogs } from "@/lib/gym-store";
import { ChevronRight, Pencil, Plus, Trash2, Check, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GomezTracker — Track Your Lifts" },
      { name: "description", content: "Simple gym tracker for sets, reps and kg." },
    ],
  }),
  component: Index,
});

function Index() {
  const { exercises, addExercise, removeExercise, updateExercise } = useExercises();
  const { logs } = useLogs();
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMuscle, setEditMuscle] = useState("");

  const startEdit = (id: string, n: string, m?: string) => {
    setEditingId(id);
    setEditName(n);
    setEditMuscle(m ?? "");
  };
  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateExercise(editingId, { name: editName.trim(), muscle: editMuscle.trim() || undefined });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Exercises</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap any exercise to log sets, reps and weight.
          </p>
        </section>

        <RestTimer />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addExercise(name.trim(), muscle.trim() || undefined);
            setName("");
            setMuscle("");
          }}
          className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New exercise (e.g. Incline Press)"
            className="flex-1 min-w-[180px]"
          />
          <Input
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            placeholder="Muscle group"
            className="w-40"
          />
          <Button type="submit" variant="hero">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>

        <ul className="space-y-2">
          {exercises.map((ex) => {
            const exLogs = logs.filter((l) => l.exerciseId === ex.id);
            const last = exLogs.sort((a, b) => b.createdAt - a.createdAt)[0];
            return (
              <li key={ex.id} className="group">
                {editingId === ex.id ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/60 bg-card p-3">
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      placeholder="Exercise name"
                      className="flex-1 min-w-[160px]"
                    />
                    <Input
                      value={editMuscle}
                      onChange={(e) => setEditMuscle(e.target.value)}
                      placeholder="Muscle group"
                      className="w-36"
                    />
                    <Button variant="hero" size="sm" onClick={saveEdit}>
                      <Check className="h-4 w-4" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-stretch gap-2">
                    <Link
                      to="/exercise/$id"
                      params={{ id: ex.id }}
                      className="flex flex-1 items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-glow"
                    >
                      <div>
                        <div className="font-semibold">{ex.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {ex.muscle ?? "—"} · {exLogs.length} session{exLogs.length === 1 ? "" : "s"}
                          {last
                            ? ` · last ${last.sets.length}×${last.sets[0]?.reps ?? 0} @ ${last.sets[0]?.kg ?? 0}kg`
                            : ""}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                    </Link>
                    <button
                      onClick={() => startEdit(ex.id, ex.name, ex.muscle)}
                      className="rounded-xl border border-border bg-card px-3 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                      aria-label="Edit exercise"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="rounded-xl border border-border bg-card px-3 text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
                      aria-label="Delete exercise"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {exercises.length === 0 && (
            <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No exercises yet. Add your first one above.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}

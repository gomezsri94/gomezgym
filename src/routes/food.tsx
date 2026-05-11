import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFoods, useFoodLogs } from "@/lib/food-store";
import { ChevronRight, Pencil, Plus, Trash2, Check, X } from "lucide-react";

export const Route = createFileRoute("/food")({
  head: () => ({
    meta: [
      { title: "Food Tracker — GomezTracker" },
      { name: "description", content: "Track foods, calories and daily intake." },
    ],
  }),
  component: FoodIndex,
});

function FoodIndex() {
  const location = useLocation();
  const { foods, addFood, removeFood, updateFood } = useFoods();
  const { logs } = useFoodLogs();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const startEdit = (id: string, n: string, c?: string) => {
    setEditingId(id);
    setEditName(n);
    setEditCategory(c ?? "");
  };
  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateFood(editingId, {
      name: editName.trim(),
      category: editCategory.trim() || undefined,
    });
    setEditingId(null);
  };

  if (location.pathname !== "/food") return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Foods</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap any food to log when you ate it and how much.
          </p>
        </section>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addFood(name.trim(), category.trim() || undefined);
            setName("");
            setCategory("");
          }}
          className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New food (e.g. Greek Yogurt)"
            className="flex-1 min-w-[180px]"
          />
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-40"
          />
          <Button type="submit" variant="hero">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>

        <ul className="space-y-2">
          {foods.map((f) => {
            const fLogs = logs.filter((l) => l.foodId === f.id);
            const last = fLogs.sort((a, b) => b.createdAt - a.createdAt)[0];
            return (
              <li key={f.id} className="group">
                {editingId === f.id ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/60 bg-card p-3">
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      placeholder="Food name"
                      className="flex-1 min-w-[160px]"
                    />
                    <Input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="Category"
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
                      to="/food/$id"
                      params={{ id: f.id }}
                      className="flex flex-1 items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-glow"
                    >
                      <div>
                        <div className="font-semibold">{f.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {f.category ?? "—"} · {fLogs.length} session{fLogs.length === 1 ? "" : "s"}
                          {last ? ` · last ${last.grams || last.amount || 0}g · ${last.calories} kcal` : ""}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                    </Link>
                    <button
                      onClick={() => startEdit(f.id, f.name, f.category)}
                      className="rounded-xl border border-border bg-card px-3 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                      aria-label="Edit food"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFood(f.id)}
                      className="rounded-xl border border-border bg-card px-3 text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
                      aria-label="Delete food"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {foods.length === 0 && (
            <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No foods yet. Add your first one above.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}

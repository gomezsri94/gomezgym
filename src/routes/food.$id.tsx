import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFood, useFoodLogs } from "@/lib/food-store";
import { todayISO } from "@/lib/gym-store";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/food/$id")({
  component: FoodPage,
});

function FoodPage() {
  const { id } = Route.useParams();
  const food = useFood(id);
  const { logs, addFoodLog, removeFoodLog } = useFoodLogs();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [grams, setGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const foodLogs = useMemo(
    () =>
      logs
        .filter((l) => l.foodId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [logs, id],
  );

  if (!food) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-muted-foreground">Food not found.</p>
          <Link to="/food" className="mt-4 inline-block text-primary underline">
            Back to list
          </Link>
        </main>
      </div>
    );
  }

  const handleSave = () => {
    const parsedQuantity = Number(quantity);
    const parsedGrams = Number(grams);
    const parsedCalories = Number(calories);
    if (!(parsedQuantity > 0) && !(parsedGrams > 0) && !(parsedCalories > 0)) return;
    addFoodLog({
      foodId: id,
      date,
      time: time || undefined,
      quantity: parsedQuantity || 0,
      brand: brand.trim() || undefined,
      grams: parsedGrams || 0,
      calories: parsedCalories || 0,
      notes: notes.trim() || undefined,
    });
    setQuantity("");
    setBrand("");
    setGrams("");
    setCalories("");
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate({ to: "/food" })}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-3xl font-bold tracking-tight">{food.name}</h1>
        {food.category && (
          <p className="mt-1 text-sm text-muted-foreground">{food.category}</p>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Log a session</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quantity</label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Grams</label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Calories</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="hero" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save session
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">History</h2>
          <ul className="mt-3 space-y-2">
            {foodLogs.map((log) => {
              const logGrams = log.grams || log.amount || 0;
              return (
                <li key={log.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {new Date(log.date + "T00:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <button
                      onClick={() => removeFoodLog(log.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                      Qty {log.quantity || 0}
                    </span>
                    {log.brand && (
                      <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                        {log.brand}
                      </span>
                    )}
                    <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                      {logGrams}g
                    </span>
                    <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                      {log.calories} kcal
                    </span>
                  </div>
                  {log.notes && <div className="mt-2 text-xs text-muted-foreground">{log.notes}</div>}
                </li>
              );
            })}
            {foodLogs.length === 0 && (
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
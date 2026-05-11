import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useFood, useFoodLogs } from "@/lib/food-store";
import { formatDateISO, todayISO } from "@/lib/gym-store";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/food/$id")({
  component: FoodPage,
});

function FoodPage() {
  const { id } = Route.useParams();
  const food = useFood(id);
  const { logs, addFoodLog, removeFoodLog, updateFoodLog } = useFoodLogs();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const foodLogs = useMemo(
    () =>
      logs
        .filter((l) => l.foodId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [logs, id],
  );

  const loggedDays = useMemo(
    () =>
      Array.from(new Set(logs.filter((l) => l.foodId === id).map((l) => l.date))).map(
        (d) => new Date(d + "T00:00:00"),
      ),
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
    const a = Number(amount);
    const c = Number(calories);
    if (!(a > 0) && !(c > 0)) return;
    addFoodLog({
      foodId: id,
      date: date ? formatDateISO(date) : todayISO(),
      amount: a || 0,
      calories: c || 0,
      notes: notes.trim() || undefined,
    });
    setAmount("");
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

        <section className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="rounded-2xl border border-border bg-card p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              modifiers={{ logged: loggedDays }}
              modifiersClassNames={{
                logged:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">
              Log entry —{" "}
              {date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Amount (g)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Calories
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="hero" onClick={handleSave}>
                <Save className="h-4 w-4" /> Save entry
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">History</h2>
          <ul className="mt-3 space-y-2">
            {foodLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-border bg-card p-4"
              >
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
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                    {log.amount} g
                  </span>
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium tabular-nums">
                    {log.calories} kcal
                  </span>
                </div>
                {log.notes && (
                  <div className="mt-2 text-xs text-muted-foreground">{log.notes}</div>
                )}
              </li>
            ))}
            {foodLogs.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No entries logged yet.
              </li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

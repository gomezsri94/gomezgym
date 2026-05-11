import { useEffect, useState } from "react";

export type FoodEntry = {
  id: string;
  foodId: string;
  date: string; // YYYY-MM-DD
  amount: number; // grams or units
  calories: number;
  notes?: string;
  createdAt: number;
};
export type Food = { id: string; name: string; category?: string };

const FOOD_KEY = "food.foods.v1";
const FOOD_LOG_KEY = "food.logs.v1";

const DEFAULT_FOODS: Food[] = [
  { id: "chicken", name: "Chicken Breast", category: "Protein" },
  { id: "rice", name: "White Rice", category: "Carbs" },
  { id: "eggs", name: "Eggs", category: "Protein" },
  { id: "oats", name: "Oats", category: "Carbs" },
  { id: "banana", name: "Banana", category: "Fruit" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  useEffect(() => {
    const existing = read<Food[] | null>(FOOD_KEY, null);
    if (!existing) {
      write(FOOD_KEY, DEFAULT_FOODS);
      setFoods(DEFAULT_FOODS);
    } else {
      setFoods(existing);
    }
    const onChange = () => setFoods(read<Food[]>(FOOD_KEY, DEFAULT_FOODS));
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  const addFood = (name: string, category?: string) => {
    const f: Food = { id: crypto.randomUUID(), name, category };
    const next = [...read<Food[]>(FOOD_KEY, DEFAULT_FOODS), f];
    write(FOOD_KEY, next);
    setFoods(next);
  };
  const removeFood = (id: string) => {
    const next = read<Food[]>(FOOD_KEY, DEFAULT_FOODS).filter((e) => e.id !== id);
    write(FOOD_KEY, next);
    setFoods(next);
  };
  const updateFood = (id: string, patch: Partial<Omit<Food, "id">>) => {
    const next = read<Food[]>(FOOD_KEY, DEFAULT_FOODS).map((e) =>
      e.id === id ? { ...e, ...patch } : e,
    );
    write(FOOD_KEY, next);
    setFoods(next);
  };
  return { foods, addFood, removeFood, updateFood };
}

export function useFood(id: string) {
  const { foods } = useFoods();
  return foods.find((f) => f.id === id) ?? null;
}

export function useFoodLogs() {
  const [logs, setLogs] = useState<FoodEntry[]>([]);
  useEffect(() => {
    setLogs(read<FoodEntry[]>(FOOD_LOG_KEY, []));
    const onChange = () => setLogs(read<FoodEntry[]>(FOOD_LOG_KEY, []));
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  const addFoodLog = (entry: Omit<FoodEntry, "id" | "createdAt">) => {
    const e: FoodEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
    const next = [...read<FoodEntry[]>(FOOD_LOG_KEY, []), e];
    write(FOOD_LOG_KEY, next);
    setLogs(next);
  };
  const removeFoodLog = (id: string) => {
    const next = read<FoodEntry[]>(FOOD_LOG_KEY, []).filter((l) => l.id !== id);
    write(FOOD_LOG_KEY, next);
    setLogs(next);
  };
  const updateFoodLog = (id: string, patch: Partial<Omit<FoodEntry, "id" | "createdAt">>) => {
    const next = read<FoodEntry[]>(FOOD_LOG_KEY, []).map((l) =>
      l.id === id ? { ...l, ...patch } : l,
    );
    write(FOOD_LOG_KEY, next);
    setLogs(next);
  };
  return { logs, addFoodLog, removeFoodLog, updateFoodLog };
}

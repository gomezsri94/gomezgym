import { useEffect, useState } from "react";

export type WorkoutSet = { reps: number; kg: number };
export type WorkoutEntry = {
  id: string;
  exerciseId: string;
  date: string; // YYYY-MM-DD
  sets: WorkoutSet[];
  createdAt: number;
};
export type Exercise = { id: string; name: string; muscle?: string };

const EX_KEY = "gym.exercises.v1";
const LOG_KEY = "gym.logs.v1";

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "bench", name: "Bench Press", muscle: "Chest" },
  { id: "squat", name: "Back Squat", muscle: "Legs" },
  { id: "deadlift", name: "Deadlift", muscle: "Back" },
  { id: "ohp", name: "Overhead Press", muscle: "Shoulders" },
  { id: "row", name: "Barbell Row", muscle: "Back" },
  { id: "pullup", name: "Pull Up", muscle: "Back" },
  { id: "curl", name: "Bicep Curl", muscle: "Arms" },
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

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  useEffect(() => {
    const existing = read<Exercise[] | null>(EX_KEY, null);
    if (!existing) {
      write(EX_KEY, DEFAULT_EXERCISES);
      setExercises(DEFAULT_EXERCISES);
    } else {
      setExercises(existing);
    }
    const onChange = () => setExercises(read<Exercise[]>(EX_KEY, DEFAULT_EXERCISES));
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  const addExercise = (name: string, muscle?: string) => {
    const e: Exercise = { id: crypto.randomUUID(), name, muscle };
    const next = [...read<Exercise[]>(EX_KEY, DEFAULT_EXERCISES), e];
    write(EX_KEY, next);
    setExercises(next);
  };
  const removeExercise = (id: string) => {
    const next = read<Exercise[]>(EX_KEY, DEFAULT_EXERCISES).filter((e) => e.id !== id);
    write(EX_KEY, next);
    setExercises(next);
  };
  return { exercises, addExercise, removeExercise };
}

export function useExercise(id: string) {
  const { exercises } = useExercises();
  return exercises.find((e) => e.id === id) ?? null;
}

export function useLogs() {
  const [logs, setLogs] = useState<WorkoutEntry[]>([]);
  useEffect(() => {
    setLogs(read<WorkoutEntry[]>(LOG_KEY, []));
    const onChange = () => setLogs(read<WorkoutEntry[]>(LOG_KEY, []));
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  const addLog = (entry: Omit<WorkoutEntry, "id" | "createdAt">) => {
    const e: WorkoutEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
    const next = [...read<WorkoutEntry[]>(LOG_KEY, []), e];
    write(LOG_KEY, next);
    setLogs(next);
  };
  const removeLog = (id: string) => {
    const next = read<WorkoutEntry[]>(LOG_KEY, []).filter((l) => l.id !== id);
    write(LOG_KEY, next);
    setLogs(next);
  };
  return { logs, addLog, removeLog };
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

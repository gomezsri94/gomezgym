import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";

const DURATION = 60;

export function RestTimer() {
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = () => {
    if (remaining === 0) setRemaining(DURATION);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(DURATION);
  };

  const progress = ((DURATION - remaining) / DURATION) * 100;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);
  const done = remaining === 0;

  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="relative h-32 w-32 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="fill-none stroke-muted"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-linear ${
              done ? "stroke-destructive" : "stroke-primary"
            }`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{remaining}</span>
          <span className="text-xs text-muted-foreground">seconds</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <div className="font-semibold">Rest Timer</div>
          <div className="text-xs text-muted-foreground">
            {done ? "Time's up — back to it!" : "60-second countdown between sets."}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {running ? (
            <Button onClick={pause} variant="secondary" size="sm">
              <Pause className="h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button onClick={start} variant="hero" size="sm">
              <Play className="h-4 w-4" /> {remaining === DURATION ? "Start" : done ? "Restart" : "Resume"}
            </Button>
          )}
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

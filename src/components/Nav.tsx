import { Link } from "@tanstack/react-router";
import { Dumbbell, CalendarDays, ListChecks } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Dumbbell className="h-4 w-4" />
          </span>
          <span>GomezTracker</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-muted text-foreground" }}
          >
            <ListChecks className="h-4 w-4" /> Exercises
          </Link>
          <Link
            to="/calendar"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-muted text-foreground" }}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </Link>
        </nav>
      </div>
    </header>
  );
}

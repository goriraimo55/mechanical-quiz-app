import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-md bg-slate-800", className)}>
      <div
        className="h-full rounded-md bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "cyan" | "amber" | "violet" | "green" | "rose" | "outline" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  cyan: "border-cyan-300/40 bg-cyan-400/12 text-cyan-100",
  amber: "border-amber-300/40 bg-amber-400/12 text-amber-100",
  violet: "border-violet-300/40 bg-violet-400/12 text-violet-100",
  green: "border-emerald-300/40 bg-emerald-400/12 text-emerald-100",
  rose: "border-rose-300/40 bg-rose-400/12 text-rose-100",
  outline: "border-border bg-transparent text-foreground",
  muted: "border-slate-500/30 bg-slate-500/12 text-slate-200"
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold leading-5",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

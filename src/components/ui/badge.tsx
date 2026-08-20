import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        muted: "bg-elevated text-muted",
        e0: "bg-e0/15 text-e0",
        warn: "bg-warn/15 text-warn",
        danger: "bg-danger/15 text-danger",
        iocl: "bg-iocl/15 text-iocl",
        bpcl: "bg-bpcl/15 text-bpcl",
        hpcl: "bg-hpcl/15 text-hpcl",
        other: "bg-other/15 text-other",
        open: "bg-e0 text-e0-fg",
        accent: "bg-accent/15 text-accent",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

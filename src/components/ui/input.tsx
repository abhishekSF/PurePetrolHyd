import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[0_0_0_1px_var(--color-border)] placeholder:text-subtle",
      "transition-[box-shadow] duration-150 ease-out",
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-accent)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

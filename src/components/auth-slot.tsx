import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div
        className="size-10 shrink-0 animate-pulse rounded-full bg-elevated"
        aria-hidden
      />
    );
  }
  if (user) {
    return (
      <div className="min-w-0 [&_span]:hidden sm:[&_span]:inline [&_button]:text-xs [&_button]:text-muted">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      aria-label="Sign in"
      className="inline-flex size-10 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg sm:h-10 sm:w-auto sm:px-3"
    >
      <User className="size-4 sm:hidden" />
      <span className="hidden text-sm sm:inline">Sign in</span>
    </Link>
  );
}

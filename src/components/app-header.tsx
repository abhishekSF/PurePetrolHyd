import { Link, useRouterState } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Find" },
  { to: "/saved", label: "Saved" },
  { to: "/report", label: "Report" },
  { to: "/about", label: "About" },
] as const;

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex min-w-0 items-baseline gap-2">
          <span className="font-display text-[1.35rem] leading-none tracking-tight text-fg sm:text-[1.5rem]">
            PurePetrol
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
            Hyd
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/" || pathname.startsWith("/stations/")
                : item.to === "/report"
                  ? pathname === "/report" || pathname === "/reports"
                  : pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-10 items-center rounded-sm px-2.5 text-sm transition-colors duration-150 sm:px-3",
                  active
                    ? "bg-elevated text-fg"
                    : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <AuthSlot />
        </nav>
      </div>
    </header>
  );
}

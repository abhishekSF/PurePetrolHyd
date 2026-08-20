import { Link, useRouterState } from "@tanstack/react-router";

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compact = pathname === "/";

  return (
    <footer className="border-t border-line bg-bg">
      <div
        className={
          compact
            ? "mx-auto max-w-[1600px] px-4 py-2 sm:px-6"
            : "mx-auto max-w-2xl px-5 py-6"
        }
      >
        {compact ? (
          <p className="text-[11px] leading-snug text-subtle">
            Crowd-sourced from r/hyderabad. Premium E0, not regular petrol.{" "}
            <Link to="/report" className="text-muted hover:text-fg">
              Report a pump
            </Link>
            . Made with Grok by{" "}
            <a
              href="https://x.com/ASMGKR"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-fg"
            >
              @ASMGKR
            </a>
          </p>
        ) : (
          <>
            <p className="text-[12px] leading-relaxed text-muted">
              Station data is crowd-sourced from the r/hyderabad community and
              other public reports. Special thanks to the original contributors.
              Availability can change. Please verify at the pump.
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-subtle">
              High-octane ethanol-free premium fuel, usually ₹160-185/litre. Not
              regular petrol.{" "}
              <Link to="/report" className="text-muted hover:text-fg">
                Report a pump
              </Link>
              .
            </p>
            <p className="mt-1.5 text-[12px] text-subtle">
              Made with Grok by{" "}
              <a
                href="https://x.com/ASMGKR"
                target="_blank"
                rel="noreferrer"
                className="text-muted underline-offset-2 hover:text-fg hover:underline"
              >
                @ASMGKR
              </a>
            </p>
          </>
        )}
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[11px] text-subtle">
          Crowd-sourced from r/hyderabad
        </p>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <Link to="/report" className="hover:text-fg">
            Report a pump
          </Link>
          <a
            href="https://x.com/ASMGKR"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg"
          >
            A project by @ASMGKR
          </a>
        </nav>
      </div>
    </footer>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  REPORT_FUEL_LABEL,
  listPumpReports,
  type PumpReport,
} from "@/lib/reports";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  loader: async () => {
    try {
      return await listPumpReports();
    } catch {
      return [] as PumpReport[];
    }
  },
  head: () => ({
    meta: [
      { title: "Reports · PurePetrol Hyd" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ReportsPage() {
  const reports = Route.useLoaderData();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
        Inbox
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-fg">
        Pump reports
      </h1>
      <p className="mt-3 text-sm text-muted">
        Submissions from the Report a Pump form. Check these before changing the
        map.
      </p>

      {reports.length === 0 ? (
        <div className="mt-10 rounded-xl bg-surface px-5 py-10 text-center shadow-[0_0_0_1px_var(--color-border)]">
          <p className="font-display text-xl text-fg">Nothing yet</p>
          <p className="mt-2 text-sm text-muted">
            New reports will show up here after someone submits the form.
          </p>
          <Link
            to="/report"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Report a pump
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {reports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function ReportCard({ report }: { report: PumpReport }) {
  const when = formatWhen(report.createdAt);
  return (
    <article className="rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--color-border)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl text-fg">{report.stationName}</h2>
        <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">
          {when}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">{report.area}</p>
      <p className="mt-3 text-sm text-fg">
        {REPORT_FUEL_LABEL[report.fuel]}
      </p>
      {report.note ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{report.note}</p>
      ) : null}
    </article>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

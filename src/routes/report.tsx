import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  REPORT_FUEL_LABEL,
  REPORT_FUELS,
  submitPumpReport,
  type ReportFuel,
} from "@/lib/reports";

export const Route = createFileRoute("/report")({
  component: ReportPage,
  head: () => ({
    meta: [
      { title: "Report a pump · PurePetrol Hyd" },
      {
        name: "description",
        content:
          "Report XP100, Speed 100, or poWer100 availability at a Hyderabad petrol pump.",
      },
    ],
  }),
});

function ReportPage() {
  const [stationName, setStationName] = useState("");
  const [area, setArea] = useState("");
  const [fuel, setFuel] = useState<ReportFuel>("xp100");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await submitPumpReport({
        data: { stationName, area, fuel, phone, note, website },
      });
      setDone(true);
      setStationName("");
      setArea("");
      setPhone("");
      setNote("");
      setWebsite("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the report.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
        Help the list
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-fg">
        Report a pump
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Confirm stock, add a missing outlet, or flag a dry tank. Reports stay in
        an inbox so they can be checked before the map changes.
      </p>

      {done ? (
        <div className="mt-8 rounded-xl bg-surface px-5 py-8 text-center shadow-[0_0_0_1px_var(--color-border)]">
          <p className="font-display text-2xl text-fg">Thanks, it's in</p>
          <p className="mt-2 text-sm text-muted">
            The report is stored. It will be reviewed before anything is added
            to the map.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => setDone(false)}>
              Send another
            </Button>
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-md px-4 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              Back to the map
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Station name" htmlFor="station-name">
            <Input
              id="station-name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="e.g. Indian Oil HITEC City"
              required
              autoComplete="off"
            />
          </Field>
          <Field label="Area" htmlFor="area">
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Madhapur"
              required
              autoComplete="off"
            />
          </Field>
          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Fuel available now
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_FUELS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFuel(id)}
                  className={cn(
                    "h-11 rounded-md text-sm font-medium",
                    fuel === id
                      ? "bg-accent text-accent-fg"
                      : "bg-elevated text-muted shadow-[0_0_0_1px_var(--color-border)] hover:text-fg",
                  )}
                >
                  {REPORT_FUEL_LABEL[id]}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Phone (optional)" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              autoComplete="tel"
            />
          </Field>
          <Field label="Short note (optional)" htmlFor="note">
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="In stock this evening / dry since morning"
              className="w-full rounded-md bg-elevated px-3 py-2.5 text-sm text-fg shadow-[0_0_0_1px_var(--color-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-accent)]"
            />
          </Field>
          <div className="hidden" aria-hidden>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Submit report"}
          </Button>
        </form>
      )}
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-subtle"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { LIST_UPDATED } from "@/data/types";
import { datasetStats } from "@/lib/stations";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About · PurePetrol Hyd" },
      {
        name: "description",
        content:
          "How PurePetrol Hyd lists XP100, Speed 100, and poWer100 pumps in Hyderabad. Crowd-sourced, not live stock.",
      },
    ],
  }),
});

function About() {
  const stats = datasetStats();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
        PurePetrol Hyd
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-fg">
        A field guide, not a live inventory
      </h1>
      <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
        Regular petrol in India is now ethanol-blended (E20). The grades still
        typically sold unblended (Indian Oil XP100, BPCL Speed 100, and HPCL
        poWer100) sit at a handful of pumps and run dry without warning.
        PurePetrol Hyd is a careful list of those outlets in Hyderabad.
      </p>
      <p className="mt-3 text-sm text-subtle">List updated {LIST_UPDATED}.</p>

      <section className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat n={stats.total} label="Stations mapped" />
        <Stat n={stats.open24} label="Open 24 hours" />
        <Stat n={3} label="Fuel grades" />
      </section>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">How to use it</h2>
        <p>
          Search or filter by grade, then tap a pin or a card. Call before you
          queue. 100-octane is often tankered from out of state and can be gone
          by afternoon.
        </p>
        <p>
          <strong className="font-medium text-fg">Confidence</strong> is about
          the listing, not tonight's tank. High means an official roster
          or a matching brand locator. Medium is a corroborated community
          list. Low is a lead.
        </p>
        <p>
          <strong className="font-medium text-fg">Last checked</strong> is when
          we last confirmed the record (name, phone, and the grade claim), not
          a live stock ping.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">The grades</h2>
        <p>
          These are the 100-octane products still typically sold ethanol-free.
          Regular XP95, Speed 95, and poWer95 are usually blended and are not
          treated as pure fuel here. This is premium fuel (usually ₹160-185/litre),
          not regular petrol.
        </p>
        <ul className="space-y-2">
          <li>
            <strong className="font-medium text-fg">IOCL XP100</strong> is Indian
            Oil's 100-octane ethanol-free petrol.
          </li>
          <li>
            <strong className="font-medium text-fg">BPCL Speed 100</strong> is
            Bharat Petroleum's 100-octane ethanol-free petrol.
          </li>
          <li>
            <strong className="font-medium text-fg">HPCL poWer100</strong> is
            Hindustan Petroleum's 100-octane ethanol-free petrol.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">Credit</h2>
        <p>
          Station data is crowd-sourced from the r/hyderabad community and other
          public reports. Special thanks to the original contributors.
        </p>
        <p>
          Availability can change. Please verify at the pump and help keep the
          list updated using the{" "}
          <Link to="/report" className="text-fg underline-offset-2 hover:underline">
            Report a Pump form
          </Link>
          .
        </p>
        <p>
          Made with Grok by{" "}
          <a
            href="https://x.com/ASMGKR"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline-offset-2 hover:underline"
          >
            @ASMGKR
          </a>
        </p>
      </section>

      <Link
        to="/"
        className="mt-12 inline-flex text-sm text-muted hover:text-fg"
      >
        Back to the map
      </Link>
    </main>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-3 shadow-[0_0_0_1px_var(--color-border)]">
      <p className="font-display text-3xl tabular-nums leading-none text-fg">{n}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-subtle">
        {label}
      </p>
    </div>
  );
}

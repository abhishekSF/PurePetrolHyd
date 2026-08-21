import { createFileRoute } from "@tanstack/react-router";
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
          "Why ethanol-free XP100, Speed 100, and poWer100 matter in Hyderabad, and how PurePetrol Hyd lists those pumps.",
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
        Regular petrol in India is now mixed with ethanol. A few Hyderabad
        pumps still sell 100-octane fuel sold as ethanol-free. This is a
        careful list of those pumps. Stock changes. Call before you queue.
      </p>
      <p className="mt-3 text-sm text-subtle">List updated {LIST_UPDATED}.</p>

      <section className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat n={stats.total} label="Stations mapped" />
        <Stat n={stats.open24} label="Open 24 hours" />
        <Stat n={3} label="Fuel grades" />
      </section>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">Why this fuel</h2>
        <p>
          Petrol at most pumps is{" "}
          <strong className="font-medium text-fg">E20</strong>: about 20%
          ethanol (alcohol from crops) mixed into petrol. That is the standard
          fuel today. Ethanol is not petrol, so the mix is a different fuel
          from what many older cars were sold on. Some rubber hoses and seals
          in those cars were not designed for this much ethanol.
        </p>
        <p>
          <strong className="font-medium text-fg">XP95 is not the workaround.</strong>{" "}
          XP95, Speed 95, and poWer95 are still ethanol-blended. They are not
          on this map.
        </p>
        <p>The nozzles this map is for:</p>
        <ul className="space-y-2">
          <li>
            <strong className="font-medium text-fg">XP100</strong> — Indian
            Oil, 100-octane, sold as ethanol-free.
          </li>
          <li>
            <strong className="font-medium text-fg">Speed 100</strong> — Bharat
            Petroleum, same idea.
          </li>
          <li>
            <strong className="font-medium text-fg">poWer100</strong> —
            Hindustan Petroleum, same idea.
          </li>
        </ul>
        <p>
          These cost more (usually ₹160–185/litre). Only some pumps have them,
          and they run dry. Call first.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">A personal note</h2>
        <p>
          Filling only this fuel every time is usually more than you need. It
          costs more, and most daily driving does not require a full tank of
          100-octane.
        </p>
        <p>
          A simple middle path some drivers use: about half a tank of XP100 /
          Speed 100 / poWer100, and half regular petrol (E20). That mix lands
          near 10% ethanol, which is less than a full E20 tank and cheaper than
          filling only premium. It is optional, not a rule. If your car is new
          and marked E20-ready, regular petrol is what it was sold for. If it
          is older, read the manual and do what you are comfortable with.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-display text-2xl text-fg">How the list works</h2>
        <p>
          <strong className="font-medium text-fg">Confidence</strong> is about
          the listing, not tonight’s tank. High means an official roster or a
          matching brand locator. Medium is a corroborated community list. Low
          is a lead.
        </p>
        <p>
          <strong className="font-medium text-fg">Last checked</strong> is when
          the record (name, phone, grade) was last confirmed, not a live stock
          ping. If a pump is wrong, use Report a pump in the footer.
        </p>
      </section>
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

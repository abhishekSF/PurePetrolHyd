import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { StationCard } from "@/components/station-card";
import { stations } from "@/data/stations";
import { useSaveStation } from "@/lib/use-save-station";
import { readSavedLocal, useFinder } from "@/store/finder";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const { savedIds, hydrateSaved, selectStation } = useFinder();
  const toggleSaved = useSaveStation();

  useEffect(() => {
    if (!savedIds.length) hydrateSaved(readSavedLocal());
  }, [savedIds.length, hydrateSaved]);

  const saved = stations.filter((s) => savedIds.includes(s.id));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
        PurePetrol Hyd
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-fg">
        Saved stations
      </h1>
      <p className="mt-3 text-sm text-muted">
        Stored on this device. Sign in if you want them on another browser.
      </p>

      {saved.length === 0 ? (
        <div className="mt-10 rounded-xl bg-surface px-5 py-10 text-center shadow-[0_0_0_1px_var(--color-border)]">
          <p className="font-display text-xl text-fg">Nothing saved yet</p>
          <p className="mt-2 text-sm text-muted">
            Tap the bookmark on a station card to keep it here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Browse the map
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {saved.map((station) => (
            <li key={station.id}>
              <StationCard
                station={station}
                saved
                onSelect={selectStation}
                onToggleSave={toggleSaved}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

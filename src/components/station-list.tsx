import { StationCard } from "@/components/station-card";
import type { Station } from "@/data/types";
import { useSaveStation } from "@/lib/use-save-station";
import { haversineKm } from "@/lib/utils";
import { useFinder } from "@/store/finder";

type Props = {
  stations: Station[];
};

export function StationList({ stations: list }: Props) {
  const { selectedId, selectStation, userLocation, savedIds } = useFinder();
  const toggleSaved = useSaveStation();

  if (!list.length) {
    return (
      <div className="rounded-xl bg-surface px-5 py-10 text-center shadow-[0_0_0_1px_var(--color-border)]">
        <p className="font-display text-xl text-fg">No stations match</p>
        <p className="mt-2 text-sm text-muted">
          Clear a filter or try another area name. Stock of 100-octane moves
          daily. A nearby pump may still have it.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {userLocation ? (
        <li className="text-xs text-muted">Nearest first</li>
      ) : null}
      {list.map((station) => (
        <li key={station.id} id={`station-${station.id}`}>
          <StationCard
            station={station}
            selected={selectedId === station.id}
            distanceKm={
              userLocation ? haversineKm(userLocation, station) : null
            }
            saved={savedIds.includes(station.id)}
            onSelect={selectStation}
            onToggleSave={toggleSaved}
          />
        </li>
      ))}
    </ul>
  );
}
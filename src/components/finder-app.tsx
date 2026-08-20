import { useEffect, useMemo, type ReactNode } from "react";
import { List, LocateFixed, Map as MapIcon } from "lucide-react";
import { StationFilters } from "@/components/station-filters";
import { StationList } from "@/components/station-list";
import { StationMap } from "@/components/station-map";
import { stations } from "@/data/stations";
import { filterStations, sortStations, datasetStats } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { readSavedLocal, useFinder } from "@/store/finder";
import { listSavedStations } from "@/lib/saved";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function FinderApp() {
  const {
    filters,
    viewMode,
    setViewMode,
    userLocation,
    locating,
    locateError,
    setLocating,
    setLocateError,
    setUserLocation,
    selectStation,
    selectedId,
    hydrateSaved,
  } = useFinder();
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    hydrateSaved(readSavedLocal());
  }, [hydrateSaved]);

  useEffect(() => {
    if (isPending || !user) return;
    void listSavedStations()
      .then((ids) => {
        if (ids.length) hydrateSaved(ids);
      })
      .catch(() => {
        /* guests / first-run: localStorage already applied */
      });
  }, [user, isPending, hydrateSaved]);

  const visible = useMemo(() => {
    return sortStations(filterStations(stations, filters), userLocation);
  }, [filters, userLocation]);
  const stats = datasetStats();

  useEffect(() => {
    if (!selectedId) return;
    if (viewMode === "map" && typeof window !== "undefined" && window.innerWidth < 1024) {
      return;
    }
    document
      .getElementById(`station-${selectedId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId, viewMode]);

  function locateMe() {
    if (!navigator.geolocation) {
      setLocateError("Location is not available in this browser.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        const nearest = sortStations(filterStations(stations, filters), loc)[0];
        if (nearest) selectStation(nearest.id);
        setLocating(false);
      },
      () => {
        setLocateError("Could not read your location. Sort stays city-wide.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden lg:flex-row">
      <aside className="flex min-h-0 flex-col overflow-hidden border-line lg:h-full lg:w-[420px] lg:shrink-0 lg:border-r">
        <div className="shrink-0 space-y-2.5 px-4 pt-3 pb-2 sm:space-y-4 sm:px-5 sm:pt-4 sm:pb-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
              Hyderabad · XP100 · Speed 100 · poWer100
            </p>
            <h1 className="mt-1 font-display text-[1.65rem] leading-none tracking-tight text-fg sm:text-3xl">
              Ethanol-free petrol
            </h1>
            <p className="mt-2 text-sm text-muted">
              {stats.total} stations · {stats.open24} open 24 hours
            </p>
            <p className="mt-1 hidden max-w-prose text-sm text-subtle sm:block">
              The grades still sold unblended. Stock moves. Call before you
              queue.
            </p>
          </div>
          <StationFilters count={visible.length} />
        </div>

        <div
          className={cn(
            "finder-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-5",
            viewMode !== "list" && "hidden lg:block",
          )}
        >
          <div className="mb-3 flex items-center gap-2 lg:hidden">
            <ViewToggle
              viewMode={viewMode}
              setViewMode={setViewMode}
              userLocation={userLocation}
              locating={locating}
              locateError={locateError}
              onLocate={locateMe}
            />
          </div>
          <StationList stations={visible} />
        </div>
      </aside>

      <section
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden p-2 sm:p-4 lg:h-full",
          viewMode === "list" && "hidden lg:block",
        )}
      >
        <StationMap stations={visible} />
        <div className="absolute top-4 left-4 z-30 right-4 flex items-center gap-2 lg:top-6 lg:right-6 lg:left-auto lg:w-auto">
          <ViewToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            userLocation={userLocation}
            locating={locating}
            locateError={locateError}
            onLocate={locateMe}
            onMap
          />
        </div>
      </section>
    </div>
  );
}

function ViewToggle({
  viewMode,
  setViewMode,
  userLocation,
  locating,
  locateError,
  onLocate,
  onMap,
}: {
  viewMode: "split" | "map" | "list";
  setViewMode: (mode: "split" | "map" | "list") => void;
  userLocation: { lat: number; lng: number } | null;
  locating: boolean;
  locateError: string | null;
  onLocate: () => void;
  onMap?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "flex rounded-md bg-elevated p-0.5 shadow-[0_0_0_1px_var(--color-border)]",
          onMap && "bg-bg/90 backdrop-blur-sm lg:hidden",
          !onMap && "lg:hidden",
        )}
      >
        <ModeButton
          active={viewMode !== "list"}
          onClick={() => setViewMode("map")}
          icon={<MapIcon className="size-3.5" />}
          label="Map"
        />
        <ModeButton
          active={viewMode === "list"}
          onClick={() => setViewMode("list")}
          icon={<List className="size-3.5" />}
          label="List"
        />
      </div>
      <button
        type="button"
        onClick={onLocate}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-fg shadow-[0_0_0_1px_var(--color-border)]",
          onMap ? "bg-bg/90 backdrop-blur-sm hover:bg-elevated" : "bg-elevated hover:bg-surface",
        )}
      >
        <LocateFixed className={cn("size-3.5", locating && "animate-pulse")} />
        {userLocation ? "Located" : "Near me"}
      </button>
      {locateError ? (
        <span className="truncate text-[11px] text-warn">{locateError}</span>
      ) : null}
    </>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-xs font-medium",
        active ? "bg-surface text-fg" : "text-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

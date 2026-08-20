import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Navigation, Phone, Plus, X } from "lucide-react";
import type { Station } from "@/data/types";
import {
  BASEMAP_BOUNDS,
  BRAND_SHORT,
  CONFIDENCE_LABEL,
  GRADE_LABEL,
  HYDERABAD_CENTER,
} from "@/data/types";
import { E0_GRADES } from "@/data/types";
import { cn, directionsHref, formatKm, haversineKm, telHref } from "@/lib/utils";
import { useFinder } from "@/store/finder";

const BRAND_FILL: Record<Station["brand"], string> = {
  iocl: "#7a93a6",
  bpcl: "#7d9474",
  hpcl: "#b08968",
  other: "#8a8880",
};

type Props = {
  stations: Station[];
};

type LaidPin = {
  station: Station;
  x: number;
  y: number;
  ox: number;
  oy: number;
};

function pinPos(lat: number, lng: number) {
  const { north, south, west, east } = BASEMAP_BOUNDS;
  const x = ((lng - west) / (east - west)) * 100;
  const y = ((north - lat) / (north - south)) * 100;
  return { x, y };
}

function spreadPins(stations: Station[], minDist: number): LaidPin[] {
  const pts: LaidPin[] = stations.map((station) => {
    const p = pinPos(station.lat, station.lng);
    return { station, x: p.x, y: p.y, ox: p.x, oy: p.y };
  });

  for (let iter = 0; iter < 60; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d >= minDist) continue;
        const push = (minDist - d) / 2;
        const nx = dx / d;
        const ny = dy / d;
        pts[i].x -= nx * push;
        pts[i].y -= ny * push;
        pts[j].x += nx * push;
        pts[j].y += ny * push;
      }
    }
    for (const p of pts) {
      p.x += (p.ox - p.x) * 0.06;
      p.y += (p.oy - p.y) * 0.06;
      p.x = Math.min(96.5, Math.max(3.5, p.x));
      p.y = Math.min(96.5, Math.max(3.5, p.y));
    }
  }
  return pts;
}

function MapPinMark({
  fill,
  active,
}: {
  fill: string;
  active?: boolean;
}) {
  const h = active ? 28 : 22;
  const w = active ? 20 : 16;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 36"
      aria-hidden
      className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.65)]"
    >
      <path
        d="M12 0C5.4 0 0 5.1 0 11.4c0 8.6 12 24.6 12 24.6S24 20 24 11.4C24 5.1 18.6 0 12 0z"
        fill={fill}
        stroke="#0c0d0b"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="11.2" r="4.2" fill="#0c0d0b" />
      {active ? (
        <circle cx="12" cy="11.2" r="2.1" fill="#ecebe4" />
      ) : null}
    </svg>
  );
}

export function StationMap({ stations: list }: Props) {
  const { selectedId, selectStation, userLocation } = useFinder();
  const selected = list.find((s) => s.id === selectedId) ?? null;
  const [zoom, setZoom] = useState(1);
  const [openCluster, setOpenCluster] = useState<Station[] | null>(null);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!userLocation) return;
    const p = pinPos(userLocation.lat, userLocation.lng);
    const inCity = p.x >= 2 && p.x <= 98 && p.y >= 2 && p.y <= 98;
    setFocus(inCity ? p : pinPos(list[0]?.lat ?? 17.43, list[0]?.lng ?? 78.41));
    setZoom(inCity ? 2.2 : 1.5);
  }, [userLocation, list]);

  const pins = useMemo(
    () => spreadPins(list, zoom >= 1.8 ? 2.6 : 5.4),
    [list, zoom],
  );

  const origin = useMemo(() => {
    if (focus) return focus;
    return pinPos(HYDERABAD_CENTER.lat, HYDERABAD_CENTER.lng);
  }, [focus]);

  const pinScale = 1 / zoom;

  function pickStation(station: Station) {
    setOpenCluster(null);
    selectStation(station.id);
    document
      .getElementById(`station-${station.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function onPinClick(station: Station, from: LaidPin) {
    const nearby = pins.filter(
      (p) =>
        p.station.id !== station.id &&
        Math.hypot(p.x - from.x, p.y - from.y) < 2.4,
    );
    if (nearby.length) {
      setOpenCluster([station, ...nearby.map((p) => p.station)]);
      selectStation(null);
      return;
    }
    pickStation(station);
  }

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-xl bg-elevated shadow-[0_0_0_1px_var(--color-border)]">
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
      >
        <img
          src="/hyderabad-basemap.jpg"
          alt="Map of Hyderabad petrol stations"
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {pins.map((p) => {
            if (Math.hypot(p.x - p.ox, p.y - p.oy) < 0.8) return null;
            return (
              <line
                key={`l-${p.station.id}`}
                x1={p.ox}
                y1={p.oy}
                x2={p.x}
                y2={p.y}
                stroke="#ecebe4"
                strokeOpacity="0.28"
                strokeWidth="0.18"
              />
            );
          })}
        </svg>
        {pins.map((p) => {
          const active = p.station.id === selectedId;
          return (
            <button
              key={p.station.id}
              type="button"
              title={p.station.name}
              aria-label={p.station.name}
              onClick={() => onPinClick(p.station, p)}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                zIndex: active ? 20 : 10,
                transform: `translate(-50%, -100%) scale(${pinScale})`,
                transformOrigin: "bottom center",
              }}
              className="absolute flex h-9 w-8 items-end justify-center"
            >
              <MapPinMark
                fill={BRAND_FILL[p.station.brand]}
                active={active}
              />
            </button>
          );
        })}
        {userLocation ? (
          <span
            className="absolute z-10 size-2.5 rounded-full bg-fg shadow-[0_0_0_3px_rgba(236,235,228,0.4)]"
            style={{
              left: `${pinPos(userLocation.lat, userLocation.lng).x}%`,
              top: `${pinPos(userLocation.lat, userLocation.lng).y}%`,
              transform: `translate(-50%, -50%) scale(${pinScale})`,
            }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute top-3 left-3 z-20 hidden rounded-md bg-bg/80 px-2.5 py-1.5 text-[11px] text-muted lg:block">
        <span className="mr-2 inline-block size-2 rounded-full bg-iocl" />
        IOCL
        <span className="mr-2 ml-3 inline-block size-2 rounded-full bg-bpcl" />
        BPCL
        <span className="mr-2 ml-3 inline-block size-2 rounded-full bg-hpcl" />
        HPCL
      </div>

      <div className="absolute top-16 right-3 z-20 flex flex-col overflow-hidden rounded-md bg-bg/90 shadow-[0_0_0_1px_var(--color-border)]">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(2.4, z + 0.7))}
          className="grid size-10 place-items-center text-fg hover:bg-elevated"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            setZoom((z) => Math.max(1, z - 0.7));
            if (zoom <= 1.7) setFocus(null);
          }}
          className="grid size-10 place-items-center text-fg hover:bg-elevated"
        >
          <Minus className="size-4" />
        </button>
      </div>

      {openCluster ? (
        <div className="absolute inset-x-3 bottom-3 z-30 max-h-[42%] overflow-y-auto rounded-lg bg-bg/95 p-2 shadow-[0_0_0_1px_var(--color-border)] backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {openCluster.length} stations here
            </p>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenCluster(null)}
              className="grid size-8 place-items-center text-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {openCluster.map((station) => (
              <li key={station.id}>
                <button
                  type="button"
                  onClick={() => pickStation(station)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-elevated"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-fg">
                      {station.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {BRAND_SHORT[station.brand]} · {station.area}
                    </span>
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: BRAND_FILL[station.brand] }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : selected ? (
        <div className="absolute inset-x-3 bottom-3 z-30 rounded-lg bg-bg/92 p-3 pr-2 shadow-[0_0_0_1px_var(--color-border)] backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {BRAND_SHORT[selected.brand]}
                {selected.open24 ? " · Open 24 hours" : ""}
                {" · "}
                {CONFIDENCE_LABEL[selected.confidence]}
              </p>
              <p className="truncate font-medium text-fg">{selected.name}</p>
              <p className="truncate text-xs text-muted">
                {selected.area}
                {userLocation
                  ? ` · ${formatKm(haversineKm(userLocation, selected))}`
                  : ""}
              </p>
              <p className="mt-1 truncate text-[11px] text-muted">
                {selected.availableGrades
                  .filter((g) => E0_GRADES.includes(g))
                  .map((g) => GRADE_LABEL[g])
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => selectStation(null)}
              className="grid size-10 shrink-0 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.phone ? (
              <a
                href={telHref(selected.phone)}
                className="inline-flex h-11 min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
              >
                <Phone className="size-3.5" />
                Call
              </a>
            ) : null}
            <a
              href={directionsHref(selected.lat, selected.lng)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-sm bg-elevated px-3 text-sm font-medium text-fg shadow-[0_0_0_1px_var(--color-border)]"
            >
              <Navigation className="size-3.5" />
              Directions
            </a>
            <Link
              to="/stations/$stationId"
              params={{ stationId: selected.id }}
              className="inline-flex h-11 items-center rounded-sm px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              Details
            </Link>
          </div>
        </div>
      ) : (
        <p className="pointer-events-none absolute inset-x-3 bottom-3 z-20 text-center text-[11px] text-muted sm:hidden">
          Tap a pin
        </p>
      )}
    </div>
  );
}

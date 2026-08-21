import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Minus, Navigation, Phone, Plus, X } from "lucide-react";
import type { Station } from "@/data/types";
import {
  BRAND_SHORT,
  CONFIDENCE_LABEL,
  GRADE_LABEL,
  HYDERABAD_CENTER,
} from "@/data/types";
import { E0_GRADES } from "@/data/types";
import { formatKm, haversineKm, telHref, directionsHref } from "@/lib/utils";
import { useFinder } from "@/store/finder";

const BRAND_FILL: Record<Station["brand"], string> = {
  iocl: "#7a93a6",
  bpcl: "#7d9474",
  hpcl: "#b08968",
  other: "#8a8880",
};

type LeafletNS = typeof import("leaflet");
type Props = { stations: Station[] };

const leafletPromise: Promise<LeafletNS> | null =
  typeof window === "undefined"
    ? null
    : import("leaflet").then((m) => (m.default ?? m) as LeafletNS);

function pinSvg(fill: string, active: boolean) {
  const stroke = active ? "#ecebe4" : "#0c0d0b";
  return `<svg width="${active ? 22 : 16}" height="${active ? 32 : 24}" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 0C5.4 0 0 5.1 0 11.4c0 8.6 12 24.6 12 24.6S24 20 24 11.4C24 5.1 18.6 0 12 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/><circle cx="12" cy="11.2" r="4.2" fill="#0c0d0b"/>${active ? `<circle cx="12" cy="11.2" r="2.1" fill="#ecebe4"/>` : ""}</svg>`;
}

function pinIcon(L: LeafletNS, brand: Station["brand"], active: boolean) {
  return L.divIcon({
    className: "station-marker",
    iconSize: active ? [22, 32] : [16, 24],
    iconAnchor: active ? [11, 32] : [8, 24],
    html: pinSvg(BRAND_FILL[brand], active),
  });
}

export function StationMap({ stations: list }: Props) {
  const { selectedId, selectStation, userLocation } = useFinder();
  const selected = list.find((s) => s.id === selectedId) ?? null;
  const [openCluster, setOpenCluster] = useState<Station[] | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const userRef = useRef<LeafletMarker | null>(null);
  const listRef = useRef(list);
  const selectedRef = useRef(selectedId);
  const selectRef = useRef(selectStation);
  const skipFlyRef = useRef(true);
  listRef.current = list;
  selectedRef.current = selectedId;
  selectRef.current = selectStation;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !leafletPromise) return;
    let cancelled = false;
    let resize: ResizeObserver | null = null;

    void leafletPromise.then((L) => {
      if (cancelled || !wrapRef.current) return;
      LRef.current = L;
      const map = L.map(wrapRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 10,
        maxZoom: 18,
        zoomSnap: 0.5,
        zoomDelta: 1,
        fadeAnimation: false,
        zoomAnimation: true,
        markerZoomAnimation: false,
        tapTolerance: 18,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          keepBuffer: 6,
          updateWhenZooming: false,
          updateWhenIdle: false,
        },
      ).addTo(map);
      map.setView([HYDERABAD_CENTER.lat, HYDERABAD_CENTER.lng], 11, {
        animate: false,
      });
      mapRef.current = map;

      for (const station of listRef.current) {
        const active = station.id === selectedRef.current;
        const marker = L.marker([station.lat, station.lng], {
          icon: pinIcon(L, station.brand, active),
          title: station.name,
          riseOnHover: true,
          zIndexOffset: active ? 600 : 0,
        }).addTo(map);
        marker.on("click", () => {
          const origin = map.latLngToLayerPoint(marker.getLatLng());
          const nearby = listRef.current.filter((s) => {
            const p = map.latLngToLayerPoint(L.latLng(s.lat, s.lng));
            return origin.distanceTo(p) < 22;
          });
          if (nearby.length > 1) {
            setOpenCluster(nearby);
            selectRef.current(null);
            return;
          }
          setOpenCluster(null);
          selectRef.current(station.id);
        });
        markersRef.current.set(station.id, marker);
      }

      map.invalidateSize();
      resize = new ResizeObserver(() => map.invalidateSize());
      resize.observe(el);
    });

    return () => {
      cancelled = true;
      resize?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    const keep = new Set(list.map((s) => s.id));
    for (const [id, marker] of markersRef.current) {
      if (!keep.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
    for (const station of list) {
      const active = station.id === selectedId;
      const icon = pinIcon(L, station.brand, active);
      const existing = markersRef.current.get(station.id);
      if (!existing) {
        const marker = L.marker([station.lat, station.lng], {
          icon,
          title: station.name,
          zIndexOffset: active ? 600 : 0,
        }).addTo(map);
        marker.on("click", () => selectRef.current(station.id));
        markersRef.current.set(station.id, marker);
      } else {
        existing.setIcon(icon);
        existing.setZIndexOffset(active ? 600 : 0);
      }
    }
  }, [list, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    if (skipFlyRef.current) {
      skipFlyRef.current = false;
      return;
    }
    const station = list.find((s) => s.id === selectedId);
    if (!station) return;
    map.setView(
      [station.lat, station.lng],
      Math.max(map.getZoom(), 14),
      { animate: true, duration: 0.25 },
    );
  }, [selectedId, list]);

  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    userRef.current?.remove();
    userRef.current = null;
    if (!userLocation) return;
    userRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 7,
      color: "#0c0d0b",
      weight: 2,
      fillColor: "#ecebe4",
      fillOpacity: 1,
    }).addTo(map);
    map.setView(
      [userLocation.lat, userLocation.lng],
      Math.max(map.getZoom(), 13),
      { animate: true, duration: 0.25 },
    );
  }, [userLocation]);

  function pickStation(station: Station) {
    setOpenCluster(null);
    selectStation(station.id);
  }

  function zoomBy(delta: number) {
    mapRef.current?.setZoom((mapRef.current.getZoom() ?? 12) + delta);
  }

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-xl bg-[#1c1d18] shadow-[0_0_0_1px_var(--color-border)]">
      <div ref={wrapRef} className="absolute inset-0 z-0" />

      <div className="pointer-events-none absolute bottom-2 left-3 z-20 rounded-md bg-bg/80 px-2 py-1 text-[10px] text-muted sm:text-[11px]">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-iocl" />
        IOCL
        <span className="mr-1.5 ml-2 inline-block size-2 rounded-full bg-bpcl" />
        BPCL
        <span className="mr-1.5 ml-2 inline-block size-2 rounded-full bg-hpcl" />
        HPCL
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col overflow-hidden rounded-md bg-bg/90 shadow-[0_0_0_1px_var(--color-border)]">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy(1)}
          className="grid size-10 place-items-center text-fg hover:bg-elevated"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(-1)}
          className="grid size-10 place-items-center text-fg hover:bg-elevated"
        >
          <Minus className="size-4" />
        </button>
      </div>

      <p className="pointer-events-none absolute right-3 bottom-2 z-10 text-[9px] text-subtle">
        Map: OSM · CARTO Dark
      </p>

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
        <p className="pointer-events-none absolute inset-x-3 bottom-8 z-20 text-center text-[11px] text-muted sm:hidden">
          Pinch to zoom · tap a pin
        </p>
      )}
    </div>
  );
}

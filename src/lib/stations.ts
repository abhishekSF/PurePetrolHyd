import { stations } from "@/data/stations";
import {
  E0_GRADES,
  type Brand,
  type Grade,
  type Station,
} from "@/data/types";
import { stationMatchesQuery } from "@/lib/search";
import { haversineKm } from "@/lib/utils";

export type FinderFilters = {
  query: string;
  grades: Grade[];
  brands: Brand[];
  open24Only: boolean;
  originalOnly: boolean;
  e0Only: boolean;
};

export const EMPTY_FILTERS: FinderFilters = {
  query: "",
  grades: [],
  brands: [],
  open24Only: false,
  originalOnly: false,
  e0Only: false,
};

export function filterStations(
  list: Station[],
  filters: FinderFilters,
): Station[] {
  return list.filter((station) => {
    if (!stationMatchesQuery(station, filters.query)) return false;
    if (filters.brands.length && !filters.brands.includes(station.brand)) {
      return false;
    }
    if (filters.grades.length) {
      const hit = filters.grades.some((g) => station.availableGrades.includes(g));
      if (!hit) return false;
    }
    if (filters.e0Only) {
      const hit = station.availableGrades.some((g) => E0_GRADES.includes(g));
      if (!hit) return false;
    }
    if (filters.open24Only && station.open24 !== true) return false;
    if (filters.originalOnly && !station.inOriginalList) return false;
    return true;
  });
}

export function sortStations(
  list: Station[],
  origin: { lat: number; lng: number } | null,
): Station[] {
  const copy = [...list];
  if (!origin) {
    copy.sort((a, b) => {
      const conf = { high: 0, medium: 1, low: 2 };
      if (conf[a.confidence] !== conf[b.confidence]) {
        return conf[a.confidence] - conf[b.confidence];
      }
      return a.name.localeCompare(b.name);
    });
    return copy;
  }
  copy.sort((a, b) => {
    const da = haversineKm(origin, a);
    const db = haversineKm(origin, b);
    return da - db;
  });
  return copy;
}

export function datasetStats() {
  const original = stations.filter((s) => s.inOriginalList).length;
  const added = stations.length - original;
  const brands = {
    iocl: stations.filter((s) => s.brand === "iocl").length,
    bpcl: stations.filter((s) => s.brand === "bpcl").length,
    hpcl: stations.filter((s) => s.brand === "hpcl").length,
    other: stations.filter((s) => s.brand === "other").length,
  };
  const open24 = stations.filter((s) => s.open24 === true).length;
  return { total: stations.length, original, added, brands, open24 };
}

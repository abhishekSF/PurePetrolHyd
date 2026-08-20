import { create } from "zustand";
import type { Brand, Grade } from "@/data/types";
import { EMPTY_FILTERS, type FinderFilters } from "@/lib/stations";

type ViewMode = "split" | "map" | "list";

type FinderState = {
  filters: FinderFilters;
  selectedId: string | null;
  viewMode: ViewMode;
  userLocation: { lat: number; lng: number } | null;
  locating: boolean;
  locateError: string | null;
  savedIds: string[];
  setQuery: (query: string) => void;
  toggleGrade: (grade: Grade) => void;
  toggleBrand: (brand: Brand) => void;
  setOpen24: (on: boolean) => void;
  setOriginalOnly: (on: boolean) => void;
  setE0Only: (on: boolean) => void;
  resetFilters: () => void;
  selectStation: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  setLocating: (on: boolean) => void;
  setLocateError: (msg: string | null) => void;
  hydrateSaved: (ids: string[]) => void;
  toggleSaved: (id: string) => void;
};

const SAVED_KEY = "purepetrol.saved";

export function readSavedLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSavedLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

export const useFinder = create<FinderState>((set, get) => ({
  filters: EMPTY_FILTERS,
  selectedId: null,
  viewMode: "map",
  userLocation: null,
  locating: false,
  locateError: null,
  savedIds: [],
  setQuery: (query) =>
    set((s) => ({ filters: { ...s.filters, query } })),
  toggleGrade: (grade) =>
    set((s) => {
      const has = s.filters.grades.includes(grade);
      return {
        filters: {
          ...s.filters,
          grades: has
            ? s.filters.grades.filter((g) => g !== grade)
            : [...s.filters.grades, grade],
        },
      };
    }),
  toggleBrand: (brand) =>
    set((s) => {
      const has = s.filters.brands.includes(brand);
      return {
        filters: {
          ...s.filters,
          brands: has
            ? s.filters.brands.filter((b) => b !== brand)
            : [...s.filters.brands, brand],
        },
      };
    }),
  setOpen24: (on) =>
    set((s) => ({ filters: { ...s.filters, open24Only: on } })),
  setOriginalOnly: (on) =>
    set((s) => ({ filters: { ...s.filters, originalOnly: on } })),
  setE0Only: (on) =>
    set((s) => ({ filters: { ...s.filters, e0Only: on } })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
  selectStation: (id) => set({ selectedId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setLocating: (on) => set({ locating: on }),
  setLocateError: (msg) => set({ locateError: msg }),
  hydrateSaved: (ids) => set({ savedIds: ids }),
  toggleSaved: (id) => {
    const current = get().savedIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    writeSavedLocal(next);
    set({ savedIds: next });
  },
}));

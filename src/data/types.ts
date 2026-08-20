export const BRANDS = ["iocl", "bpcl", "hpcl", "other"] as const;
export type Brand = (typeof BRANDS)[number];

export const GRADES = [
  "xp100",
  "power100",
  "speed100",
  "e0",
  "xp95",
  "power95",
  "speed95",
] as const;
export type Grade = (typeof GRADES)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export type CoordPrecision = "official" | "estimated";

export type SourceKind =
  | "user-list"
  | "iocl-official"
  | "official-locator"
  | "community";

export type Station = {
  id: string;
  name: string;
  brand: Brand;
  area: string;
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
  coordPrecision: CoordPrecision;
  availableGrades: Grade[];
  open24: boolean | null;
  hoursNote?: string;
  lastVerified: string;
  confidence: Confidence;
  source: string;
  sourceKind: SourceKind;
  notes?: string;
  mapsUrl?: string;
  inOriginalList: boolean;
};

export const BRAND_LABEL: Record<Brand, string> = {
  iocl: "Indian Oil",
  bpcl: "Bharat Petroleum",
  hpcl: "Hindustan Petroleum",
  other: "Other",
};

export const BRAND_SHORT: Record<Brand, string> = {
  iocl: "IOCL",
  bpcl: "BPCL",
  hpcl: "HPCL",
  other: "Other",
};

export const GRADE_LABEL: Record<Grade, string> = {
  xp100: "XP100",
  power100: "poWer100",
  speed100: "Speed 100",
  e0: "E0 / pure",
  xp95: "XP95",
  power95: "poWer95",
  speed95: "Speed 95",
};

export const GRADE_HINT: Record<Grade, string> = {
  xp100: "Indian Oil 100-octane. Typically sold as ethanol-free.",
  power100: "HPCL 100-octane. Typically sold as ethanol-free.",
  speed100: "BPCL 100-octane. Typically sold as ethanol-free.",
  e0: "Reported ethanol-free / unblended petrol. Confirm at the pump.",
  xp95: "Indian Oil 95-octane. Usually ethanol-blended, not E0.",
  power95: "HPCL 95-octane. Usually ethanol-blended, not E0.",
  speed95: "BPCL 95-octane. Usually ethanol-blended, not E0.",
};

export const E0_GRADES: Grade[] = ["xp100", "power100", "speed100", "e0"];

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const SOURCE_LABEL: Record<SourceKind, string> = {
  "user-list": "Community list",
  "iocl-official": "Indian Oil XP100 roster",
  "official-locator": "Official brand locator",
  "community": "Driver reports",
};

export const LIST_UPDATED = "19 Aug 2026";

export const HYDERABAD_CENTER = { lat: 17.432, lng: 78.408 };

export const BASEMAP_BOUNDS = {
  north: 17.64402203,
  west: 78.13476562,
  south: 17.14079039,
  east: 78.75,
};


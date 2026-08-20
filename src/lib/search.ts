import { E0_GRADES, type Grade, type Station } from "@/data/types";

export type ParsedQuery = {
  grades: Grade[];
  place: string;
  tokens: string[];
};

const STOP = new Set([
  "near",
  "in",
  "at",
  "around",
  "for",
  "the",
  "a",
  "an",
  "me",
  "my",
  "find",
  "show",
  "where",
  "is",
  "are",
  "any",
  "some",
  "please",
  "pump",
  "pumps",
  "station",
  "stations",
  "petrol",
  "fuel",
  "gas",
  "hyderabad",
  "hyd",
  "and",
  "or",
  "to",
  "of",
  "with",
  "available",
  "get",
  "looking",
  "look",
  "want",
  "need",
  "still",
  "sells",
  "selling",
  "got",
  "has",
  "have",
]);

const GRADE_PHRASES: { grade: Grade; re: RegExp }[] = [
  { grade: "xp100", re: /\bxp\s*100\b|\bxp100\b|indian\s*oil\s*100|\biocl\s*100\b/gi },
  { grade: "speed100", re: /\bspeed\s*100\b|\bbpcl\s*100\b/gi },
  { grade: "power100", re: /\bpow(?:e|é)r\s*100\b|\bhpcl\s*100\b|\bhp\s*100\b/gi },
  {
    grade: "e0",
    re: /\be0\b|ethanol[\s-]*free|unblended|pure\s+(?:petrol|fuel)|premium/gi,
  },
];

const PLACE_ALIASES: Record<string, string[]> = {
  kukatpally: ["kukatpally", "kphb", "kukat pally", "kukatpalli"],
  madhapur: ["madhapur", "hitec", "hitech", "hi-tech", "hitec city"],
  "jubilee hills": ["jubilee", "jubliee", "jubilee hills", "checkpost"],
  raidurg: ["raidurg", "raidurgam", "ikea", "tsiic"],
  tarnaka: ["tarnaka", "osmania", "ou"],
  attapur: ["attapur", "rajendranagar"],
  gachibowli: ["gachibowli", "nanakramguda", "financial district"],
  ameerpet: ["ameerpet", "sr nagar", "sanath nagar", "erragadda"],
  banjara: ["banjara", "banjara hills"],
  miyapur: ["miyapur", "hafeezpet"],
};

export function parseSearchQuery(raw: string): ParsedQuery {
  let text = raw.trim().toLowerCase().replace(/[?,.!]/g, " ");
  const grades: Grade[] = [];

  for (const { grade, re } of GRADE_PHRASES) {
    if (re.test(text)) {
      grades.push(grade);
      text = text.replace(re, " ");
    }
  }

  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));

  return { grades, place: tokens.join(" "), tokens };
}

function haystack(station: Station): string {
  return [
    station.name,
    station.area,
    station.address,
    station.phone ?? "",
    station.brand,
    station.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function placeHits(station: Station, parsed: ParsedQuery): boolean {
  if (!parsed.tokens.length) return true;
  const hay = haystack(station);
  if (parsed.tokens.every((t) => hay.includes(t))) return true;

  const place = parsed.place;
  for (const aliases of Object.values(PLACE_ALIASES)) {
    const asked = aliases.some(
      (a) => place.includes(a) || a.split(" ").every((p) => parsed.tokens.includes(p)),
    );
    if (!asked) continue;
    if (aliases.some((a) => hay.includes(a))) return true;
  }
  return false;
}

function gradeHits(station: Station, grades: Grade[]): boolean {
  if (!grades.length) return true;
  return grades.some((g) => {
    if (g === "e0") {
      return station.availableGrades.some((x) => E0_GRADES.includes(x));
    }
    return station.availableGrades.includes(g);
  });
}

export function stationMatchesQuery(station: Station, raw: string): boolean {
  const q = raw.trim();
  if (!q) return true;
  const parsed = parseSearchQuery(q);
  if (parsed.grades.length || parsed.tokens.length) {
    return gradeHits(station, parsed.grades) && placeHits(station, parsed);
  }
  return haystack(station).includes(q.toLowerCase());
}

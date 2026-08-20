import { Link } from "@tanstack/react-router";
import { Bookmark, Clock3, MapPin, Navigation, Phone } from "lucide-react";
import {
  BRAND_SHORT,
  CONFIDENCE_LABEL,
  GRADE_LABEL,
  type Station,
} from "@/data/types";
import { E0_GRADES } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { cn, directionsHref, formatKm, telHref } from "@/lib/utils";

const brandTone = {
  iocl: "iocl",
  bpcl: "bpcl",
  hpcl: "hpcl",
  other: "other",
} as const;

const confTone = {
  high: "e0",
  medium: "warn",
  low: "danger",
} as const;

type Props = {
  station: Station;
  selected?: boolean;
  distanceKm?: number | null;
  saved?: boolean;
  onSelect?: (id: string) => void;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
};

export function StationCard({
  station,
  selected,
  distanceKm,
  saved,
  onSelect,
  onToggleSave,
  compact,
}: Props) {
  const e0 = station.availableGrades.filter((g) => E0_GRADES.includes(g));

  return (
    <article
      className={cn(
        "rounded-xl bg-surface p-3 shadow-[0_0_0_1px_var(--color-border)] transition-[box-shadow,background-color] duration-150",
        selected && "bg-elevated shadow-[0_0_0_1px_var(--color-accent)]",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(station.id)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={brandTone[station.brand]}>{BRAND_SHORT[station.brand]}</Badge>
            {station.open24 ? (
              <Badge tone="open">Open 24 hours</Badge>
            ) : null}
            <Badge tone={confTone[station.confidence]}>
              {CONFIDENCE_LABEL[station.confidence].toUpperCase()}
            </Badge>
          </div>
          <h3 className="mt-2 font-display text-lg leading-snug tracking-tight text-fg">
            {station.name}
          </h3>
          <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted" />
            <span>
              {station.area}
              {distanceKm != null ? (
                <span className="font-medium text-fg"> · {formatKm(distanceKm)}</span>
              ) : null}
            </span>
          </p>
        </button>
        {onToggleSave ? (
          <button
            type="button"
            aria-label={saved ? "Remove from saved" : "Save station"}
            onClick={() => onToggleSave(station.id)}
            className={cn(
              "relative grid size-10 shrink-0 place-items-center rounded-sm text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
              saved && "text-accent",
            )}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {e0.map((g) => (
          <Badge key={g} tone="e0">
            {GRADE_LABEL[g]}
          </Badge>
        ))}
      </div>

      {!compact ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-subtle">
          {station.notes ?? station.address}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {station.phone ? (
          <a
            href={telHref(station.phone)}
            className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg hover:opacity-90 sm:flex-none"
          >
            <Phone className="size-3.5" />
            Call
          </a>
        ) : null}
        <a
          href={directionsHref(station.lat, station.lng)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center gap-1.5 rounded-sm bg-elevated px-3 text-sm font-medium text-fg shadow-[0_0_0_1px_var(--color-border)] hover:bg-surface sm:flex-none"
        >
          <Navigation className="size-3.5" />
          Directions
        </a>
        <Link
          to="/stations/$stationId"
          params={{ stationId: station.id }}
          className="inline-flex h-11 items-center rounded-sm px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
        >
          Details
        </Link>
      </div>

      {station.open24 === false && station.hoursNote ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
          <Clock3 className="size-3" />
          {station.hoursNote}
        </p>
      ) : null}
    </article>
  );
}

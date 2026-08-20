import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import {
  BRAND_LABEL,
  CONFIDENCE_LABEL,
  GRADE_HINT,
  GRADE_LABEL,
  SOURCE_LABEL,
  type Station,
} from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, directionsHref, formatPhone, formatVerified, telHref } from "@/lib/utils";
import { useSaveStation } from "@/lib/use-save-station";
import { useFinder } from "@/store/finder";

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

export function StationDetail({
  station,
  onClose,
}: {
  station: Station;
  onClose?: () => void;
}) {
  const { savedIds } = useFinder();
  const toggleSaved = useSaveStation();
  const saved = savedIds.includes(station.id);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={brandTone[station.brand]}>{BRAND_LABEL[station.brand]}</Badge>
            {station.open24 ? <Badge tone="open">Open 24 hours</Badge> : null}
          </div>
          <h1 className="mt-3 font-display text-3xl leading-none tracking-tight text-fg">
            {station.name}
          </h1>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-subtle" />
            <span>
              {station.area}
              <span className="text-subtle"> · {station.address}</span>
            </span>
          </p>
        </div>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {station.phone ? (
          <a
            href={telHref(station.phone)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-elevated px-4 text-sm font-medium text-fg shadow-[0_0_0_1px_var(--color-border)] hover:bg-surface"
          >
            <Phone className="size-4" />
            Call {formatPhone(station.phone)}
          </a>
        ) : null}
        <a
          href={directionsHref(station.lat, station.lng)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          <Navigation className="size-4" />
          Get directions
        </a>
        <button
          type="button"
          onClick={() => toggleSaved(station.id)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium shadow-[0_0_0_1px_var(--color-border)] hover:bg-elevated",
            saved ? "text-accent" : "text-fg",
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <section>
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
          Grades
        </h2>
        <ul className="mt-2 space-y-2">
          {station.availableGrades.map((g) => (
            <li
              key={g}
              className="rounded-lg bg-surface px-3 py-2.5 shadow-[0_0_0_1px_var(--color-border)]"
            >
              <p className="text-sm font-medium text-fg">{GRADE_LABEL[g]}</p>
              <p className="mt-0.5 text-xs text-muted">{GRADE_HINT[g]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Meta
          label="Last checked"
          value={formatVerified(station.lastVerified)}
        />
        <Meta
          label="Confidence"
          value={CONFIDENCE_LABEL[station.confidence]}
          tone={confTone[station.confidence]}
        />
        <Meta
          label="Location"
          value={station.coordPrecision === "official" ? "Surveyed" : "Approximate"}
        />
        <Meta
          label="Listed as"
          value={SOURCE_LABEL[station.sourceKind]}
        />
      </section>

      {(station.notes ||
        (station.open24 === false && station.hoursNote) ||
        station.phone == null) && (
        <section className="rounded-lg bg-surface px-4 py-3 shadow-[0_0_0_1px_var(--color-border)]">
          {station.notes ? (
            <p className="text-sm leading-relaxed text-muted">{station.notes}</p>
          ) : null}
          {station.open24 === false && station.hoursNote ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
              <Clock3 className="size-3.5" />
              {station.hoursNote}
            </p>
          ) : null}
          {station.phone == null ? (
            <p className={station.notes || station.hoursNote ? "mt-2 text-xs text-subtle" : "text-xs text-subtle"}>
              No public phone listed. Use directions and confirm the grade at the pump.
            </p>
          ) : null}
        </section>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        {station.mapsUrl ? (
          <a
            href={station.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-muted hover:text-fg"
          >
            Open in Google Maps
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
        <Link to="/" className="text-muted hover:text-fg">
          Back to map
        </Link>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "e0" | "warn" | "danger";
}) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5 shadow-[0_0_0_1px_var(--color-border)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className={cn("mt-1 text-sm tabular-nums text-fg", tone === "e0" && "text-e0", tone === "warn" && "text-warn", tone === "danger" && "text-danger")}>
        {value}
      </p>
    </div>
  );
}

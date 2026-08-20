import type { ReactNode } from "react";
import { RotateCcw, Search } from "lucide-react";
import { BRAND_SHORT, LIST_UPDATED, type Brand, type Grade } from "@/data/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFinder } from "@/store/finder";

const GRADE_CHIPS: { id: Grade; label: string }[] = [
  { id: "xp100", label: "XP100" },
  { id: "speed100", label: "Speed 100" },
  { id: "power100", label: "poWer100" },
  { id: "e0", label: "E0 / pure" },
];

const BRAND_CHIPS: Brand[] = ["iocl", "bpcl", "hpcl"];

export function StationFilters({ count }: { count: number }) {
  const {
    filters,
    setQuery,
    toggleGrade,
    toggleBrand,
    setOpen24,
    resetFilters,
  } = useFinder();

  const dirty =
    filters.query.trim() !== "" ||
    filters.grades.length > 0 ||
    filters.brands.length > 0 ||
    filters.open24Only;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="XP100 near Madhapur"
          aria-label="Search stations by area or phrase"
          className="pl-10"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GRADE_CHIPS.map((chip) => {
          const on = filters.grades.includes(chip.id);
          return (
            <Chip key={chip.id} active={on} onClick={() => toggleGrade(chip.id)}>
              {chip.label}
            </Chip>
          );
        })}
        {BRAND_CHIPS.map((brand) => {
          const on = filters.brands.includes(brand);
          return (
            <Chip key={brand} active={on} onClick={() => toggleBrand(brand)}>
              {BRAND_SHORT[brand]}
            </Chip>
          );
        })}
        <Chip active={filters.open24Only} onClick={() => setOpen24(!filters.open24Only)}>
          Open 24 hours
        </Chip>
        {dirty ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-xs text-muted hover:bg-elevated hover:text-fg"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        ) : null}
      </div>

      <p className="hidden text-xs tabular-nums text-subtle sm:block">
        {count} station{count === 1 ? "" : "s"}
        {dirty ? " match" : " across Hyderabad"}
        {" · "}
        updated {LIST_UPDATED}
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-medium transition-colors duration-150",
        active
          ? "bg-accent text-accent-fg"
          : "bg-elevated text-muted shadow-[0_0_0_1px_var(--color-border)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { StationDetail } from "@/components/station-detail";
import { StationMap } from "@/components/station-map";
import { getStation } from "@/data/stations";
import { useFinder } from "@/store/finder";
import { useEffect } from "react";

export const Route = createFileRoute("/stations/$stationId")({
  component: StationPage,
  ssr: false,
  head: ({ params }) => {
    const station = getStation(params.stationId);
    const title = station
      ? `${station.name} · ${station.area} | PurePetrol Hyd`
      : "Station | PurePetrol Hyd";
    const description = station
      ? `${station.name} in ${station.area}. ${station.availableGrades.join(", ")} ethanol-free / 100-octane petrol in Hyderabad.`
      : "Hyderabad ethanol-free petrol station.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
});

function StationPage() {
  const { stationId } = Route.useParams();
  const station = getStation(stationId);
  const selectStation = useFinder((s) => s.selectStation);

  useEffect(() => {
    if (station) selectStation(station.id);
  }, [station, selectStation]);

  if (!station) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-5 py-16 text-center">
        <h1 className="font-display text-3xl text-fg">Station not found</h1>
        <p className="mt-3 text-sm text-muted">
          That pump is not on this list. It may have been renamed or removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
        >
          Back to the map
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 lg:flex-row lg:px-6">
      <div className="min-w-0 flex-1 lg:max-w-xl">
        <StationDetail station={station} />
      </div>
      <div className="min-h-[320px] flex-1 lg:min-h-[560px]">
        <StationMap stations={[station]} />
      </div>
    </main>
  );
}

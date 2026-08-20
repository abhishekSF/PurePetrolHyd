import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export const REPORT_FUELS = ["xp100", "power100", "speed100", "other"] as const;
export type ReportFuel = (typeof REPORT_FUELS)[number];

export const REPORT_FUEL_LABEL: Record<ReportFuel, string> = {
  xp100: "XP100",
  power100: "poWer100",
  speed100: "Speed 100",
  other: "Other",
};

export type PumpReport = {
  id: number;
  stationName: string;
  area: string;
  fuel: ReportFuel;
  phone: string | null;
  note: string | null;
  createdAt: string;
};

export type ReportInput = {
  stationName: string;
  area: string;
  fuel: ReportFuel;
  phone?: string;
  note?: string;
  website?: string;
};

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function parseFuel(value: unknown): ReportFuel {
  const v = String(value ?? "");
  if ((REPORT_FUELS as readonly string[]).includes(v)) return v as ReportFuel;
  throw new Error("Pick which fuel is available.");
}

export const submitPumpReport = createServerFn({ method: "POST" })
  .validator((input: ReportInput) => {
    const stationName = clean(input.stationName, 80);
    const area = clean(input.area, 80);
    const fuel = parseFuel(input.fuel);
    const phoneRaw = clean(input.phone, 16).replace(/[^\d]/g, "");
    const note = clean(input.note, 280);
    const website = clean(input.website, 80);
    if (stationName.length < 2) throw new Error("Add the station name.");
    if (area.length < 2) throw new Error("Add the area.");
    if (phoneRaw && phoneRaw.length !== 10) {
      throw new Error("Phone should be a 10-digit Indian mobile number.");
    }
    return {
      stationName,
      area,
      fuel,
      phone: phoneRaw || null,
      note: note || null,
      website,
    };
  })
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    const sql = await getSql();
    await sql`
      insert into pump_reports (station_name, area, fuel, phone, note)
      values (${data.stationName}, ${data.area}, ${data.fuel}, ${data.phone}, ${data.note})
    `;
    return { ok: true as const };
  });

export const listPumpReports = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      station_name: string;
      area: string;
      fuel: string;
      phone: string | null;
      note: string | null;
      created_at: string;
    }>`
      select id, station_name, area, fuel, phone, note, created_at
      from pump_reports
      order by created_at desc
      limit 100
    `;
    return rows.map(
      (r): PumpReport => ({
        id: r.id,
        stationName: r.station_name,
        area: r.area,
        fuel: (REPORT_FUELS as readonly string[]).includes(r.fuel)
          ? (r.fuel as ReportFuel)
          : "other",
        phone: r.phone,
        note: r.note,
        createdAt: r.created_at,
      }),
    );
  },
);

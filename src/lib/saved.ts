import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const listSavedStations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ station_id: string }>`
      select station_id from saved_stations
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map((r) => r.station_id);
  });

export const toggleSavedStation = createServerFn({ method: "POST" })
  .validator((stationId: string) => stationId.trim())
  .middleware([authMiddleware])
  .handler(async ({ context, data: stationId }) => {
    if (!stationId) return { saved: false as const };
    const sql = await getSql();
    const existing = await sql<{ station_id: string }>`
      select station_id from saved_stations
      where user_id = ${context.userId} and station_id = ${stationId}
    `;
    if (existing.length) {
      await sql`
        delete from saved_stations
        where user_id = ${context.userId} and station_id = ${stationId}
      `;
      return { saved: false as const };
    }
    await sql`
      insert into saved_stations (user_id, station_id)
      values (${context.userId}, ${stationId})
    `;
    return { saved: true as const };
  });

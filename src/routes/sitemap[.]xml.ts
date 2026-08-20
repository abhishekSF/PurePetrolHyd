import { createFileRoute } from "@tanstack/react-router";
import { stations } from "@/data/stations";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const host = new URL(request.url).origin;
        const urls = [
          "",
          "/about",
          "/report",
          ...stations.map((s) => `/stations/${s.id}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url><loc>${host}${path}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

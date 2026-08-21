import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import appCss from "../styles.css?url";

const APP_NAME = "PurePetrol Hyd";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Find ethanol-free and 100-octane petrol in Hyderabad: Indian Oil XP100, BPCL Speed 100, and HPCL poWer100. Crowd-sourced pump list with map, call, and 24-hour flags.",
      },
      { name: "robots", content: "index,follow" },
      { name: "author", content: "ASMGKR" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#0c0d0b" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: APP_NAME },
      {
        name: "twitter:description",
        content:
          "Map of Hyderabad pumps that still sell ethanol-free 100-octane petrol.",
      },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content:
          "PurePetrol Hyd: a map of Hyderabad pumps that still sell ethanol-free and 100-octane petrol.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      ...(host
        ? [
            { property: "og:url", content: `https://${host}/` },
            { name: "twitter:url", content: `https://${host}/` },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://a.basemaps.cartocdn.com" },
      { rel: "preconnect", href: "https://b.basemaps.cartocdn.com" },
      { rel: "preconnect", href: "https://c.basemaps.cartocdn.com" },
      { rel: "dns-prefetch", href: "https://basemaps.cartocdn.com" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ...(host ? [{ rel: "canonical", href: `https://${host}/` }] : []),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: APP_NAME,
          applicationCategory: "TravelApplication",
          operatingSystem: "Any",
          description:
            "Find ethanol-free XP100, Speed 100, and poWer100 petrol pumps in Hyderabad.",
          author: { "@type": "Person", name: "ASMGKR", url: "https://x.com/ASMGKR" },
          areaServed: "Hyderabad, Telangana, India",
        }),
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <div className="flex h-dvh flex-col overflow-hidden">
            <AppHeader />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Outlet />
            </div>
            <SiteFooter />
          </div>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { FinderApp } from "@/components/finder-app";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false,
});

function Home() {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <FinderApp />
    </main>
  );
}

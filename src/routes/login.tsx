import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function start(providerId: string) {
    setError(null);
    setPending(providerId);
    try {
      await signIn(providerId, { callbackURL: "/", errorCallbackURL: "/login" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in did not complete.";
      setError(
        msg.toLowerCase().includes("pop-up") || msg.toLowerCase().includes("popup")
          ? "The sign-in window was blocked. Allow pop-ups for this page and try again."
          : msg,
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="grid flex-1 place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
          PurePetrol Hyd
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-fg">
          Sign in
        </h1>
        <p className="mt-3 text-sm text-muted">
          Optional. The map works without an account. Sign in only if you want
          saved stations on another phone.
        </p>

        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                disabled={pending !== null}
                onClick={() => start(p.providerId)}
              >
                {pending === p.providerId
                  ? "Opening…"
                  : `Continue with ${p.label}`}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <p className="mt-4 text-xs text-subtle">
          Google or X will open. In this preview that may be a pop-up.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex text-sm text-muted hover:text-fg"
        >
          Back to the map
        </Link>
      </div>
    </main>
  );
}

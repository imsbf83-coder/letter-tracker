"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-wide text-ink-soft mb-2">
            DAK &amp; FILE REGISTER
          </p>
          <h1 className="font-serif text-3xl font-bold text-ink">
            Letter Tracking
          </h1>
        </div>

        <form
          action={formAction}
          className="bg-paper-raised border border-line rounded-sm p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-ink mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ink mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-vermillion">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ink text-paper font-medium rounded-sm py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Ask your administrator if you don&apos;t have an account.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePasswordAction } from "@/lib/actions/account-actions";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-paper-raised border border-line rounded-sm p-6 space-y-4 max-w-sm"
    >
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Current password
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          New password
        </label>
        <input
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Confirm new password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      {state?.error && <p className="text-sm text-vermillion">{state.error}</p>}
      {state?.success && <p className="text-sm text-forest">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper font-medium rounded-sm px-5 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}

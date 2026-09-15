"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addUserAction } from "@/lib/actions/admin-actions";

export default function AddUserForm({
  desks,
}: {
  desks: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    addUserAction,
    undefined
  );
  const [role, setRole] = useState<"DESK" | "ADMIN">("DESK");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 mb-6 bg-paper-raised border border-line rounded-sm p-4"
    >
      <div>
        <label className="block text-xs font-medium text-ink mb-1">
          Full name
        </label>
        <input
          name="name"
          required
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink mb-1">
          Username
        </label>
        <input
          name="username"
          required
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink mb-1">
          Password
        </label>
        <input
          name="password"
          type="text"
          required
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink mb-1">
          Role
        </label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "DESK" | "ADMIN")}
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="DESK">Desk user</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>
      {role === "DESK" && (
        <div>
          <label className="block text-xs font-medium text-ink mb-1">
            Desk
          </label>
          <select
            name="deskId"
            required
            defaultValue=""
            className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <option value="" disabled>
              Select…
            </option>
            {desks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add user"}
      </button>
      {state?.error && (
        <p className="text-sm text-vermillion w-full">{state.error}</p>
      )}
    </form>
  );
}

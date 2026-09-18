"use client";

import { useActionState, useState } from "react";
import {
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/admin-actions";

export default function UserRow({
  user,
  desks,
}: {
  user: {
    id: string;
    name: string;
    username: string;
    role: "ADMIN" | "DESK";
    deskIds: string[];
    deskTitles: string;
  };
  desks: { id: string; title: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "DESK">(user.role);
  const [state, formAction, pending] = useActionState(
    updateUserAction,
    undefined
  );

  if (!editing) {
    return (
      <tr className="border-t border-line">
        <td className="px-4 py-3">{user.name}</td>
        <td className="px-4 py-3 text-ink-soft">{user.username}</td>
        <td className="px-4 py-3">{user.role}</td>
        <td className="px-4 py-3 text-ink-soft">{user.deskTitles || "—"}</td>
        <td className="px-4 py-3 text-right space-x-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-ink underline underline-offset-2"
          >
            Edit
          </button>
          <form action={deleteUserAction} className="inline">
            <input type="hidden" name="id" value={user.id} />
            <button className="text-xs text-vermillion underline underline-offset-2">
              Remove
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-line bg-paper-raised/60">
      <td colSpan={5} className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={user.id} />
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Full name
            </label>
            <input
              name="name"
              defaultValue={user.name}
              required
              className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Username
            </label>
            <input
              name="username"
              defaultValue={user.username}
              required
              className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              New password (optional)
            </label>
            <input
              name="password"
              type="text"
              placeholder="Leave blank to keep current"
              className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Role
            </label>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "DESK")}
              className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="DESK">Desk user</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          {role === "DESK" && (
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Desks (select one or more)
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border border-line rounded-sm px-3 py-1.5 bg-white max-w-xs">
                {desks.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-1.5 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      name="deskIds"
                      value={d.id}
                      defaultChecked={user.deskIds.includes(d.id)}
                    />
                    {d.title}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="bg-ink text-paper text-xs font-medium rounded-sm px-3 py-1.5 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-ink-soft underline underline-offset-2"
          >
            {state && !state.error ? "Done" : "Cancel"}
          </button>
          {state?.error && (
            <p className="text-sm text-vermillion w-full">{state.error}</p>
          )}
        </form>
      </td>
    </tr>
  );
}

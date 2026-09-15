import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { SessionPayload } from "@/lib/auth";

export default function AppShell({
  session,
  deskTitle,
  children,
}: {
  session: SessionPayload;
  deskTitle?: string | null;
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/letters/new", label: "New Letter" },
    { href: "/letters", label: "All Letters" },
  ];

  if (session.role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Admin" });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-mono text-[11px] tracking-wide text-paper/60">
            DAK &amp; FILE REGISTER
          </p>
          <h1 className="font-serif text-xl font-bold mt-1 leading-tight">
            Letter Tracking
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-sm text-sm text-paper/85 hover:bg-white/10 hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 text-sm">
          <p className="font-medium">{session.name}</p>
          <p className="text-paper/60 text-xs">
            {deskTitle ?? (session.role === "ADMIN" ? "Administrator" : "")}
          </p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="text-xs text-paper/60 hover:text-paper underline underline-offset-2"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-5xl">{children}</main>
    </div>
  );
}

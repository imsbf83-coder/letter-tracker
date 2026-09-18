import Link from "next/link";
import { requireAdmin, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import ClearLettersForm from "./ClearLettersForm";

export default async function AdminPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitles(session.deskIds);

  const sections = [
    {
      href: "/admin/schools",
      title: "Schools",
      desc: "The 80+ schools letters come from.",
    },
    {
      href: "/admin/desks",
      title: "Desks",
      desc: "Designations a letter can be marked to.",
    },
    {
      href: "/admin/users",
      title: "Users",
      desc: "Login accounts, one per desk.",
    },
    {
      href: "/admin/retrievals",
      title: "Retrieval requests",
      desc: "Approve or reject requests to reopen closed letters.",
    },
  ];

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">Admin</h2>
      <p className="text-ink-soft text-sm mb-6">
        Set up schools, desks, and user accounts.
      </p>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block bg-paper-raised border border-line rounded-sm p-5 hover:border-ink transition-colors"
          >
            <h3 className="font-serif font-bold text-ink mb-1">{s.title}</h3>
            <p className="text-sm text-ink-soft">{s.desc}</p>
          </Link>
        ))}
      </div>

      <h3 className="font-serif text-lg font-bold text-vermillion mb-1">
        Danger zone
      </h3>
      <p className="text-sm text-ink-soft mb-3">
        Permanently deletes every letter and its movement history. Schools,
        desks, and user accounts are kept.
      </p>
      <ClearLettersForm />
    </AppShell>
  );
}

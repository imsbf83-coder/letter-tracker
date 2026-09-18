import { requireSession, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession();
  const deskTitle = await getDeskTitles(session.deskIds);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        Your account
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        Signed in as <span className="font-medium text-ink">{session.name}</span>{" "}
        ({session.username})
        {deskTitle ? ` — ${deskTitle}` : ""}
      </p>

      <h3 className="font-serif text-lg font-bold text-ink mb-3">
        Change password
      </h3>
      <ChangePasswordForm />
    </AppShell>
  );
}

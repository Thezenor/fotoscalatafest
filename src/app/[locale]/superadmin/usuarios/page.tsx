import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { listUsers } from "@/server/services/admin.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const me = await requireRole("SUPERADMIN");
  const users = await listUsers();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Usuarios y roles" />
      <UsersTable users={users} currentId={me.id} />
    </main>
  );
}

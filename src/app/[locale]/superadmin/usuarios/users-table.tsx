"use client";

import { useActionState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import {
  createUserAction,
  changeRoleAction,
  toggleActiveAction,
  type NewUserState,
} from "@/server/actions/superadmin";
import { Input } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Role = "SUPERADMIN" | "ADMIN" | "MODERATOR";
interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
}

export function UsersTable({ users, currentId }: { users: UserRow[]; currentId: string }) {
  const [state, formAction, pending] = useActionState<NewUserState, FormData>(
    createUserAction,
    {},
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      {/* Crear usuario */}
      <form
        action={formAction}
        className="grid grid-cols-1 gap-3 rounded-[16px] border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Input name="email" type="email" placeholder="email@dominio.com" required />
        <Input name="name" placeholder="Nombre (opcional)" />
        <select
          name="role"
          defaultValue="MODERATOR"
          className="h-[50px] rounded-sm border border-line bg-surface-2 px-3 font-body text-[15px] text-white outline-none focus:border-brand"
        >
          <option value="MODERATOR">Moderador</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPERADMIN">Superadmin</option>
        </select>
        <Input name="password" type="password" placeholder="Contraseña (≥8)" required />
        <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase" })}>
          <UserPlus className="h-5 w-5" /> Crear
        </button>
        {state.error && <p className="col-span-full text-sm text-danger">{state.error}</p>}
        {state.ok && <p className="col-span-full text-sm text-success">Usuario creado.</p>}
      </form>

      {/* Lista */}
      <div className="overflow-hidden rounded-[16px] border border-line">
        <table className="w-full text-left">
          <thead className="bg-surface-2 font-mono text-[11px] uppercase tracking-wide text-mist">
            <tr>
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line bg-surface">
                <td className="p-3">
                  <p className="font-body text-sm font-semibold text-white">{u.name ?? "—"}</p>
                  <p className="font-body text-xs text-mist">{u.email}</p>
                </td>
                <td className="p-3">
                  <select
                    defaultValue={u.role}
                    disabled={u.id === currentId || isPending}
                    onChange={(e) =>
                      startTransition(() => changeRoleAction(u.id, e.target.value as Role))
                    }
                    className="rounded-sm border border-line bg-surface-2 px-2 py-1 font-body text-sm text-white disabled:opacity-50"
                  >
                    <option value="MODERATOR">Moderador</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </td>
                <td className="p-3">
                  {u.id === currentId ? (
                    <Badge tone="neutral">Tú</Badge>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => toggleActiveAction(u.id, !u.isActive))
                      }
                    >
                      <Badge tone={u.isActive ? "success" : "danger"}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

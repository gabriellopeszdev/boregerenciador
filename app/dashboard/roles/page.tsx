import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { canManageRoles } from "@/lib/discord-roles"
import { RolesTable } from "@/components/roles-table"

export default async function RolesPage() {
  const session = await getServerAuthSession()

  if (!session || !session.user?.name) {
    redirect("/login")
  }

  const hasPermission = await canManageRoles()

  if (!hasPermission) {
    redirect("/dashboard")
  }

  // DEBUG: logar sessão e permissão no servidor para investigação
  try {
    // eslint-disable-next-line no-console
    console.log('[dashboard/roles/page] hasPermission (server):', hasPermission)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[dashboard/roles/page] erro ao logar debug:', err)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Legend e Mod</h1>
        <p className="text-muted-foreground">Conceda ou remova cargos de Legend e Moderador para os players</p>
      </div>

      <RolesTable currentUser={session.user as any} />
    </div>
  )
}

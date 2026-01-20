import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { canManageRoles } from "@/lib/discord-roles"
import { RolesTable } from "@/components/roles-table"
import { Server } from "lucide-react"

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
    <main className="min-h-screen flex flex-col items-center justify-start py-12 px-2 bg-gradient-to-br from-background to-[#23272f]">
      <div className="w-full max-w-5xl flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-extrabold text-foreground drop-shadow-lg">Gerenciar Legend e Mod</h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">Conceda ou remova cargos de Legend e Moderador para os players com segurança e auditabilidade.</p>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <RolesTable currentUser={session.user as any} />
      </div>
    </main>
  )
}

import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlayersTable } from "@/components/players-table"
import { canManageRoles } from "@/lib/discord-roles"
import { RoleButtonClient } from "@/components/role-button-client"
import ResetVipButton from "@/components/reset-vip-button"
import { isUserCeo } from "@/lib/discord-roles"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ban, VolumeX, Crown } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  const hasPermission = await canManageRoles()
  const isCeoServer = await isUserCeo()

  // DEBUG: logar sessão e permissão no servidor para investigação
  try {
    // eslint-disable-next-line no-console
    console.log('[dashboard/page] session (server):', {
      user: session?.user?.name ?? null,
      id: session?.user?.id ?? null,
      accessToken: (session as any)?.accessToken ?? null,
    })
    // eslint-disable-next-line no-console
    console.log('[dashboard/page] hasPermission:', hasPermission)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[dashboard/page] erro ao logar debug:', err)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Players</h1>
          <p className="text-muted-foreground">Visualize e gerencie todos os players do servidor</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Server-side button (fallback) for users already permitted by Discord roles */}
          {hasPermission && (
            <Button asChild>
              <Link href="/dashboard/roles">
                <Crown className="h-4 w-4 mr-2" />
                Setar Legend & Mod
              </Link>
            </Button>
          )}

          {/* Client-side check/button (keeps verifying via accessToken) - use server fallback to avoid flicker */}
          <div className="hidden sm:block">
            <RoleButtonClient initialCanManage={hasPermission} />
          </div>
          <div className="hidden sm:block">
            <ResetVipButton initialIsCeo={isCeoServer} />
          </div>
          <Button variant="destructive" asChild>
            <Link href="/dashboard/bans">
              <Ban className="h-4 w-4 mr-2" />
              Desbanir Player
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/mutes">
              <VolumeX className="h-4 w-4 mr-2" />
              Desmutar Player
            </Link>
          </Button>
        </div>
      </div>
      {/* DEBUG PANEL - visible only in development to inspect session & permission */}
      {/* {process.env.NODE_ENV !== "production" && (
        <div className="rounded-md border p-3 bg-muted/10 text-sm text-muted-foreground">
          <div className="font-medium">Debug (dev): sessão e permissão</div>
          <div>Usuário: {session.user?.name ?? "-"}</div>
          <div>HasPermission: {String(hasPermission)}</div>
          <div>AccessToken presente: {Boolean((session as any)?.accessToken) ? "sim" : "não"}</div>
        </div>
      )} */}

      <PlayersTable currentUser={session.user} />
    </div>
  )
}
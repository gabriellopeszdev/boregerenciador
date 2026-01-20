import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlayersTable } from "@/components/players-table";
import { canManageRoles, getUserRoles, isUserCeo } from "@/lib/discord-roles";
import { Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  const hasPermission = await canManageRoles()
  const isCeoServer = await isUserCeo()
  const userRoles = await getUserRoles()

  // Criar objeto currentUser com base nos roles do Discord
  const currentUser = {
    ...session.user,
    ceo: userRoles.isCEO ? 1 : 0,
    diretor: userRoles.isDiretor ? 1 : 0,
    gerente: userRoles.isGerente ? [1] : null,
  }

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
    // eslint-disable-next-line no-console
    console.log('[dashboard/page] userRoles:', userRoles)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[dashboard/page] erro ao logar debug:', err)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-12 px-2 bg-gradient-to-br from-background to-[#23272f]">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-extrabold text-foreground drop-shadow-lg">Players</h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">Visualize e gerencie todos os jogadores do servidor, aplique punições e altere permissões.</p>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <PlayersTable currentUser={currentUser} />
      </div>
    </main>
  );
}
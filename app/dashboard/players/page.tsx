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

  return (
    <main className="flex flex-col items-center justify-start py-4 px-2">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-7 h-7 text-blue-500" />
          <h1 className="text-2xl font-extrabold text-foreground drop-shadow-lg">Players</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-2xl">Visualize e gerencie todos os jogadores do servidor, aplique punições e altere permissões.</p>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <PlayersTable currentUser={currentUser} />
      </div>
    </main>
  );
}
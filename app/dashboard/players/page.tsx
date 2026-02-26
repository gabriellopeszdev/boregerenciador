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
    // `dono` é usado em vários componentes para checagem de permissão
    dono: userRoles.isCEO ? 1 : 0,
    ceo: userRoles.isCEO ? 1 : 0,
    diretor: userRoles.isDiretor ? 1 : 0,
    gerente: userRoles.isGerente ? 1 : 0,
  }

  return (
    <main className="flex flex-col items-center justify-start py-1 px-2">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center mb-1">
        <div className="bg-blue-500/10 p-1 rounded-lg mb-0.5">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-base font-bold text-white tracking-tight">Players</h1>
        <p className="text-zinc-500 text-xs">
          Visualize e gerencie todos os jogadores do servidor, aplique punições e altere permissões.
        </p>
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <PlayersTable currentUser={currentUser} />
      </div>
    </main>
  );
}
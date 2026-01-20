import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRoles, getUserRoles, isUserCeo } from "@/lib/discord-roles";
import ModuleCard from "@/components/module-card";
import { Ban, VolumeX, Users, Shield, Server } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  const hasPermission = await canManageRoles()
  const isCeoServer = await isUserCeo()
  const userRoles = await getUserRoles()

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-[#23272f] overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col items-center justify-center py-12 px-4">
        <Image src="/logo_bore.png" alt="Logo Bore" width={70} height={70} className="mb-4 object-contain" unoptimized />
        <h1 className="text-4xl font-extrabold mb-2 text-foreground text-center drop-shadow-lg">Bore Gerenciador</h1>
        <p className="text-lg text-muted-foreground mb-10 text-center max-w-2xl">Bem-vindo ao painel de administração do sistema. Escolha um módulo para gerenciar jogadores, punições ou acessar funções avançadas.</p>
        <div className="flex flex-wrap justify-center gap-8 w-full">
          <ModuleCard
            href="/dashboard/players"
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="Players"
            description="Visualize e gerencie todos os jogadores do servidor."
          />
          <ModuleCard
            href="/dashboard/bans"
            icon={<Ban className="w-6 h-6 text-red-500" />}
            title="Bans"
            description="Gerencie solicitações de banimento e desbanimento."
          />
          <ModuleCard
            href="/dashboard/mutes"
            icon={<VolumeX className="w-6 h-6 text-yellow-500" />}
            title="Mutes"
            description="Gerencie solicitações de mute e desmute."
          />
          {hasPermission && (
            <ModuleCard
              href="/dashboard/roles"
              icon={<Server className="w-6 h-6 text-indigo-500" />}
              title="Roles"
              description="Defina Mod e Legend para jogadores rapidamente."
            />
          )}
          <ModuleCard
            href="/dashboard/admin"
            icon={<Shield className="w-6 h-6 text-purple-600" />}
            title="Admin Endpoints"
            description="Acesse e monitore os endpoints públicos detalhadamente."
          />
        </div>
        <footer className="mt-12 text-muted-foreground text-xs opacity-70 text-center w-full">&copy; {new Date().getFullYear()} Bore Gerenciador</footer>
      </div>
    </main>
  );
}
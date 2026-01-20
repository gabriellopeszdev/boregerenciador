import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MutesTable } from "@/components/mutes-table";
import { VolumeX } from "lucide-react";

export default async function MutesPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-12 px-2 bg-gradient-to-br from-background to-[#23272f]">
      <div className="w-full max-w-5xl flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <VolumeX className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-extrabold text-foreground drop-shadow-lg">Mutes</h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">Visualize e gerencie todos os mutes do servidor, remova restrições e acompanhe o histórico.</p>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <MutesTable />
      </div>
    </main>
  );
}

import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BansTable } from "@/components/bans-table";
import { Ban } from "lucide-react";

export default async function BansPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-12 px-2 bg-gradient-to-br from-background to-[#23272f]">
      <div className="w-full flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Ban className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-extrabold text-foreground drop-shadow-lg">Bans</h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">Visualize e gerencie todos os bans do servidor, remova punições e acompanhe o histórico.</p>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <BansTable />
      </div>
    </main>
  );
}

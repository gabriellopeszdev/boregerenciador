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
    <main className="flex flex-col items-center justify-start py-4 px-2">
      <div className="w-full flex flex-col items-center mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Ban className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-extrabold text-foreground drop-shadow-lg">Bans</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-2xl">Visualize e gerencie todos os bans do servidor, remova punições e acompanhe o histórico.</p>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <BansTable />
      </div>
    </main>
  );
}

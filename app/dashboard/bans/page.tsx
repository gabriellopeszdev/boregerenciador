import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BansTable } from "@/components/bans-table"

export default async function BansPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Bans</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os bans do servidor</p>
      </div>

      <BansTable />
    </div>
  )
}

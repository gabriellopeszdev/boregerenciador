import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MutesTable } from "@/components/mutes-table"

export default async function MutesPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Mutes</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os mutes do servidor</p>
      </div>

      <MutesTable />
    </div>
  )
}

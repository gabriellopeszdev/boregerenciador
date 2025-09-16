import { getServerAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlayersTable } from "@/components/players-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ban, VolumeX } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Players</h1>
          <p className="text-muted-foreground">Visualize e gerencie todos os players do servidor</p>
        </div>
        <div className="flex gap-2">
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
      <PlayersTable currentUser={session.user} />
    </div>
  )
}
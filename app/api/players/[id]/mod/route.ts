import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { setPlayerMod, removePlayerMod } from "@/lib/queries"
import { getPlayerById } from "@/lib/queries"
import { getUserRoles } from "@/lib/discord-roles"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user?.name) {
      console.warn("[api/players/[id]/mod] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const playerId = Number.parseInt(id)
    if (isNaN(playerId)) {
      console.warn("[api/players/[id]/mod] ID de jogador inválido:", id)
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    const userRoles = await getUserRoles()

    if (!userRoles.hasAnyPermission) {
      console.warn(`[api/players/[id]/mod] ${session.user.name} sem permissão (CEO/Diretor/Gerente)`)
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { action, rooms } = body

    if (!action || !["add", "remove"].includes(action)) {
      console.warn("[api/players/[id]/mod] Ação inválida:", action)
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (action === "add") {
      if (!rooms || !Array.isArray(rooms)) {
        console.warn("[api/players/[id]/mod] Salas inválidas para adicionar Mod")
        return NextResponse.json({ error: "Invalid rooms array" }, { status: 400 })
      }
      const target = await getPlayerById(playerId)
      if (!target) {
        console.warn(`[api/players/[id]/mod] Jogador não encontrado: ${playerId}`)
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      console.log(`[api/players/[id]/mod] Adicionando Mod ao jogador ${playerId} nas salas ${rooms}`)
      await setPlayerMod(playerId, rooms)
    } else {
      const target = await getPlayerById(playerId)
      if (!target) {
        console.warn(`[api/players/[id]/mod] Jogador não encontrado: ${playerId}`)
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      console.log(`[api/players/[id]/mod] Removendo Mod do jogador ${playerId}`)
      await removePlayerMod(playerId)
    }

    console.log(`[api/players/[id]/mod] Mod ${action === "add" ? "adicionado" : "removido"} com sucesso`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/players/[id]/mod] Erro:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

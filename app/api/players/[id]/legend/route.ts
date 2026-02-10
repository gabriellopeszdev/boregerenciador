import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { setPlayerLegend, removePlayerLegend } from "@/lib/queries"
import { getPlayerById } from "@/lib/queries"
import { getUserRoles } from "@/lib/discord-roles"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user?.name) {
      console.warn("[api/players/[id]/legend] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const playerId = Number.parseInt(id)
    if (isNaN(playerId)) {
      console.warn("[api/players/[id]/legend] ID de jogador inválido:", id)
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    const userRoles = await getUserRoles()

    if (!userRoles.hasAnyPermission) {
      console.warn(`[api/players/[id]/legend] ${session.user.name} sem permissão (CEO/Diretor/Gerente)`)
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { action, vipLevel, rooms, expirationDate } = body

    if (!action || !["add", "remove"].includes(action)) {
      console.warn("[api/players/[id]/legend] Ação inválida:", action)
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (action === "add") {
      // vipLevel must be provided and be either 3 (VIP) or 4 (Legend)
      if (!expirationDate || (vipLevel !== 3 && vipLevel !== 4)) {
        console.warn("[api/players/[id]/legend] vipLevel inválido ou expirationDate faltando")
        return NextResponse.json({ error: "Missing or invalid vipLevel/expirationDate" }, { status: 400 })
      }
      // Verificar se o player existe antes de atualizar (evita updates em massa)
      const target = await getPlayerById(playerId)
      if (!target) {
        console.warn(`[api/players/[id]/legend] Jogador não encontrado: ${playerId}`)
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      console.log(`[api/players/[id]/legend] Setando vip=${vipLevel} ao jogador ${playerId} até ${expirationDate}`)
      setPlayerLegend(playerId, vipLevel, expirationDate)
    } else {
      const target = await getPlayerById(playerId)
      if (!target) {
        console.warn(`[api/players/[id]/legend] Jogador não encontrado: ${playerId}`)
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      console.log(`[api/players/[id]/legend] Removendo Legend do jogador ${playerId}`)
      removePlayerLegend(playerId)
    }

    console.log(`[api/players/[id]/legend] Legend ${action === "add" ? "adicionado" : "removido"} com sucesso`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/players/[id]/legend] Erro:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

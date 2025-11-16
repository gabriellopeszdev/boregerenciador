import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { unbanPlayer } from "@/lib/queries"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      console.warn("[api/bans/[id]/unban] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const banId = Number.parseInt(id)
    if (isNaN(banId)) {
      console.warn("[api/bans/[id]/unban] ID de ban inválido:", id)
      return NextResponse.json({ error: "Invalid ban ID" }, { status: 400 })
    }

    console.log(`[api/bans/[id]/unban] Removendo ban ${banId}`)
    await unbanPlayer(banId)
    console.log(`[api/bans/[id]/unban] Ban ${banId} removido com sucesso`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/bans/[id]/unban] Erro ao desbanir:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

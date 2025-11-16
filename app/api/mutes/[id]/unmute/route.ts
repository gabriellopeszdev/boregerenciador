import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { unmutePlayer } from "@/lib/queries"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      console.warn("[api/mutes/[id]/unmute] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const muteId = Number.parseInt(id)
    if (isNaN(muteId)) {
      console.warn("[api/mutes/[id]/unmute] ID de mute inválido:", id)
      return NextResponse.json({ error: "Invalid mute ID" }, { status: 400 })
    }

    console.log(`[api/mutes/[id]/unmute] Removendo mute ${muteId}`)
    await unmutePlayer(muteId)
    console.log(`[api/mutes/[id]/unmute] Mute ${muteId} removido com sucesso`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/mutes/[id]/unmute] Erro ao desmutar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { mutePlayer, getMutesPaginated, getMuteCount } from "@/lib/queries"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      console.warn("[api/mutes] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const searchTerm = url.searchParams.get("searchTerm") || ""

    console.log(`[api/mutes] GET - página ${page}, limite ${limit}, busca: "${searchTerm}"`)

    const mutes = await getMutesPaginated(page, limit, searchTerm)
    const totalCount = await getMuteCount(searchTerm)

    console.log(`[api/mutes] Retornando ${mutes.length} de ${totalCount} mutes`)

    return NextResponse.json({
      data: mutes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[api/mutes] Erro ao buscar mutes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user?.name) {
      console.warn("[api/mutes] POST - Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, time, reason, conn, ipv4, room } = await request.json()

    if (!name || !reason || !time) {
      console.warn("[api/mutes] POST - Campos obrigatórios faltando:", { name, reason, time })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const muteDate = new Date(time)
    if (isNaN(muteDate.getTime())) {
      console.warn("[api/mutes] POST - Data inválida:", time)
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    }

    const staffDiscordName = session.user.name
    console.log(`[api/mutes] POST - Mutando ${name} por ${reason} (staff: ${staffDiscordName})`)

    // SEGURANÇA: Auth nunca vem do frontend
    mutePlayer(
      name,
      staffDiscordName,
      reason,
      conn || "",
      ipv4 || "",
      "", // auth removido do frontend
      muteDate,
      room || 1
    )

    console.log(`[api/mutes] POST - Mute criado com sucesso para ${name}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/mutes] POST - Erro ao mutar jogador:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
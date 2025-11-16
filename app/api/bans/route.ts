import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { banPlayer, getBansPaginated, getBanCount } from "@/lib/queries"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      console.warn("[api/bans] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const searchTerm = url.searchParams.get("searchTerm") || ""

    console.log(`[api/bans] GET - página ${page}, limite ${limit}, busca: "${searchTerm}"`)

    const bans = await getBansPaginated(page, limit, searchTerm)
    const totalCount = await getBanCount(searchTerm)

    console.log(`[api/bans] Retornando ${bans.length} de ${totalCount} bans`)

    return NextResponse.json({
      data: bans,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[api/bans] Erro ao buscar bans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user?.name) {
      console.warn("[api/bans] POST - Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, time, reason, conn, ipv4, auth, room } = await request.json()

    if (!name || !reason || !time) {
      console.warn("[api/bans] POST - Campos obrigatórios faltando:", { name, reason, time })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const banDate = new Date(time)
    if (isNaN(banDate.getTime())) {
      console.warn("[api/bans] POST - Data inválida:", time)
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    }

    const staffDiscordName = session.user.name
    console.log(`[api/bans] POST - Banindo ${name} por ${reason} (staff: ${staffDiscordName})`)

    await banPlayer(
      name,
      staffDiscordName,
      reason,
      conn || "",
      ipv4 || "",
      auth || "",
      banDate,
      room || 0,
    )
    
    console.log(`[api/bans] POST - Ban criado com sucesso para ${name}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/bans] POST - Erro ao banir jogador:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
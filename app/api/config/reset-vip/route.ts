import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { isUserCeo } from "@/lib/discord-roles"
import { resetAllVip } from "@/lib/queries"

export async function POST() {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Checar se o usuário é CEO (DB-first, depois Discord)
    const isCeo = await isUserCeo()
    if (!isCeo) {
      return NextResponse.json({ error: "Sem permissão (apenas CEO)" }, { status: 403 })
    }

    await resetAllVip()
    console.log('[api/config/reset-vip] Todos os VIPs foram resetados para 0')

    return NextResponse.json({ success: true, message: 'Todos os VIPs foram resetados para 0' })
  } catch (error) {
    console.error('[api/config/reset-vip] Erro:', error)
    return NextResponse.json({ error: 'Erro ao resetar VIPs' }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { canManageRoles } from "@/lib/discord-roles"
import { getServerAuthSession } from "@/lib/auth"
import { getPlayerByName } from "@/lib/queries"

// Simple in-memory cache to avoid hitting Discord repeatedly during dev/runtime
const cache = new Map<string, { canManage: boolean; expires: number }>()
const CACHE_TTL = 1000 * 60 * 2 // 2 minutes

async function checkRemote(token: string) {
  try {
    const guildId = process.env.DISCORD_GUILD_ID
    const ceoRoleId = process.env.DISCORD_CEO_ROLE_ID
    const diretorRoleId = process.env.DISCORD_DIRETOR_ROLE_ID
    const gerenteRoleId = process.env.DISCORD_GERENTE_ROLE_ID
    if (!guildId) return false

    const resp = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) return false
    const member = await resp.json()
    const roles: string[] = member.roles || []
    const has = roles.some((r: string) => [ceoRoleId, diretorRoleId, gerenteRoleId].includes(r))
    return { has, userId: member.user?.id }
  } catch (err) {
    console.error('[api/config/can-manage] checkRemote erro:', err)
    return false
  }
}

export async function GET() {
  try {
    const session = await getServerAuthSession()
    const allowed = await canManageRoles()

    // In dev, return extra debug info to help diagnose mismatches
    if (process.env.NODE_ENV !== "production") {
      let player = null
      try {
        if (session?.user?.name) player = await getPlayerByName(session.user.name)
      } catch (err) {
        console.warn('[api/config/can-manage] erro ao buscar player por nome:', err)
      }

      return NextResponse.json({
        canManage: Boolean(allowed),
        debug: {
          sessionUser: session?.user ?? null,
          playerFromDb: player ?? null,
        },
      })
    }

    return NextResponse.json({ canManage: Boolean(allowed) })
  } catch (err) {
    console.error('[api/config/can-manage] erro:', err)
    return NextResponse.json({ canManage: false }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = body?.token
    if (!token) return NextResponse.json({ canManage: false }, { status: 400 })

    // If we already cached by token user id, return cache
    const cached = Array.from(cache.values()).find((c) => c.expires > Date.now())
    if (cached) return NextResponse.json({ canManage: Boolean(cached.canManage) })

    const remote = await checkRemote(token)
    if (!remote || !remote.userId) return NextResponse.json({ canManage: false })

    cache.set(remote.userId, { canManage: Boolean(remote.has), expires: Date.now() + CACHE_TTL })
    return NextResponse.json({ canManage: Boolean(remote.has) })
  } catch (err) {
    console.error('[api/config/can-manage POST] erro:', err)
    return NextResponse.json({ canManage: false }, { status: 500 })
  }
}

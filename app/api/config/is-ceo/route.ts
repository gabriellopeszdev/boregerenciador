import { NextResponse } from "next/server"
import { isUserCeo } from "@/lib/discord-roles"
import { getServerAuthSession } from "@/lib/auth"
import { getPlayerByName } from "@/lib/queries"

export async function GET() {
  try {
    const session = await getServerAuthSession()
    const isCeo = await isUserCeo()

    if (process.env.NODE_ENV !== "production") {
      let player = null
      try {
        if (session?.user?.name) player = await getPlayerByName(session.user.name)
      } catch (err) {
        console.warn('[api/config/is-ceo] erro ao buscar player por nome:', err)
      }

      return NextResponse.json({ isCeo, debug: { sessionUser: session?.user ?? null, playerFromDb: player ?? null } })
    }

    return NextResponse.json({ isCeo })
  } catch (err) {
    console.error('[api/config/is-ceo] erro:', err)
    return NextResponse.json({ isCeo: false }, { status: 500 })
  }
}

// Allow client to POST with an access token to verify remote roles (avoids SSR token issue)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = body?.token
    if (!token) return NextResponse.json({ isCeo: false }, { status: 400 })

    const guildId = process.env.DISCORD_GUILD_ID
    const ceoRoleId = process.env.DISCORD_CEO_ROLE_ID
    if (!guildId || !ceoRoleId) return NextResponse.json({ isCeo: false })

    const resp = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) return NextResponse.json({ isCeo: false })
    const member = await resp.json()
    const roles: string[] = member.roles || []
    return NextResponse.json({ isCeo: roles.includes(ceoRoleId) })
  } catch (err) {
    console.error('[api/config/is-ceo POST] erro:', err)
    return NextResponse.json({ isCeo: false }, { status: 500 })
  }
}

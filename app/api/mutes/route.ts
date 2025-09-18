import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { mutePlayer, getMutes } from "@/lib/queries"

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mutes = await getMutes()
    return NextResponse.json(mutes)
  } catch (error) {
    console.error("Error fetching mutes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    // Adicionamos uma verificação extra para garantir que session.user.name existe
    if (!session || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, reason, conn, ipv4, auth, room } = await request.json()

    if (!name || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const staffDiscordName = session.user.name;

    await mutePlayer(name, staffDiscordName, reason, conn || "", ipv4 || "", auth || "", room || 1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error muting player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
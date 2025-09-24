import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { banPlayer, getBans } from "@/lib/queries"

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bans = await getBans()
    return NextResponse.json(bans)
  } catch (error) {
    console.error("Error fetching bans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, time, reason, conn, ipv4, auth, room } = await request.json()

    if (!name || !reason || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const banDate = new Date(time);
    if (isNaN(banDate.getTime())) {
        return NextResponse.json({ error: "Invalid time format" }, { status: 400 });
    }

    const staffDiscordName = session.user.name;

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
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error banning player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
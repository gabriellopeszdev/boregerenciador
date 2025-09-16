import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { mutePlayer, getMutes } from "@/lib/queries"
import { getPlayerByName } from "@/lib/queries"

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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, reason, conn, ipv4, auth, room } = await request.json()

    if (!name || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current user data
    const currentUser = await getPlayerByName(session.user.name!)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await mutePlayer(name, currentUser.name, reason, conn || "", ipv4 || "", auth || "", room || 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error muting player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { unbanPlayer } from "@/lib/queries"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const banId = Number.parseInt(params.id)
    if (isNaN(banId)) {
      return NextResponse.json({ error: "Invalid ban ID" }, { status: 400 })
    }

    await unbanPlayer(banId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unbanning player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

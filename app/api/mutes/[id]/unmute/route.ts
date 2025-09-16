import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { unmutePlayer } from "@/lib/queries"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const muteId = Number.parseInt(params.id)
    if (isNaN(muteId)) {
      return NextResponse.json({ error: "Invalid mute ID" }, { status: 400 })
    }

    await unmutePlayer(muteId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unmuting player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

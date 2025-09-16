import { type NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPlayersPaginated, getPlayerCount } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const searchTerm = url.searchParams.get("searchTerm") || "";

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }

    // AQUI ESTÁ O AJUSTE. Garantir que a lógica de busca seja consistente.
    const players = await getPlayersPaginated(page, limit, searchTerm);
    const totalCount = await getPlayerCount(searchTerm);

    return NextResponse.json({
      players,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
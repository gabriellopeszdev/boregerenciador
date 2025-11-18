import { type NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPlayersPaginated, getPlayerCount } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      console.warn("[api/players] Acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const searchTerm = url.searchParams.get("searchTerm") || "";

    console.log(`[api/players] GET - página ${page}, limite ${limit}, busca: "${searchTerm}"`)

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      console.warn("[api/players] Parâmetros de paginação inválidos")
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }

    const players = await getPlayersPaginated(page, limit, searchTerm);
    const totalCount = await getPlayerCount(searchTerm);

    console.log(`[api/players] Retornando ${players.length} de ${totalCount} players`)

    return NextResponse.json({
      players,
      totalCount,
    });
  } catch (error) {
    console.error("[api/players] Erro ao buscar players:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
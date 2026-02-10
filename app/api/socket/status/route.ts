import { NextRequest, NextResponse } from "next/server";
import { getServerIO } from "@/lib/socket";

export async function GET(request: NextRequest) {
  try {
    const io = getServerIO();

    if (!io) {
      return NextResponse.json(
        {
          status: "initializing",
          message: "Socket.IO está inicializando...",
          socketPath: "/api/socketio",
          info: "Acesse novamente em alguns segundos",
        },
        { status: 202 }
      );
    }

    const connectedClients = io.engine.clientsCount;

    return NextResponse.json({
      status: "connected",
      message: "Socket.IO está funcionando",
      socketPath: "/api/socketio",
      connectedClients,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] /api/socket/status - erro:", error);
    return NextResponse.json(
      {
        status: "error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

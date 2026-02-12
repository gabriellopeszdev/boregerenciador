import { io as ioClient, Socket } from "socket.io-client";
import type { Server } from "socket.io";

// Tipos globais para o servidor
declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

// ===== CLIENTE SOCKET.IO (para uso no frontend) =====

let clientSocket: Socket | null = null;

export function getClientSocket(): Socket {
  if (!clientSocket) {
    const url = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    
    clientSocket = ioClient(url, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    clientSocket.on("connect", () => {});

    clientSocket.on("disconnect", () => {});

    clientSocket.on("connect_error", () => {});
  }

  return clientSocket;
}

export function disconnectClientSocket(): void {
  if (clientSocket) {
    clientSocket.disconnect();
    clientSocket = null;
  }
}

// ===== HELPERS PARA O SERVIDOR (para uso nas API routes) =====

export function getServerIO(): Server | undefined {
  return global.io;
}

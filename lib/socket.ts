import { io as ioClient, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";

// ===== CLIENTE SOCKET.IO (para uso no frontend) =====

let clientSocket: Socket | null = null;

export function getClientSocket(): Socket {
  if (!clientSocket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL
      || process.env.NEXT_PUBLIC_BACKEND_URL
      || (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000")
    
    clientSocket = ioClient(url, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: async (callback) => {
        const session = await getSession()
        callback({ token: session?.accessToken || "" })
      },
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
